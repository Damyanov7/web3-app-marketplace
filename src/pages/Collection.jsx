import { ethers } from 'ethers';
import { useSigner } from 'wagmi';
import { useForm } from "react-hook-form"
import {yupResolver} from "@hookform/resolvers/yup"
import * as yup  from "yup";
import React, { useState, useEffect } from 'react';
import marketplaceABI from '../abi/Marketplace.json';
import deployABI from '../abi/Deployment.json';
import Button from '../components/ui/Button';
import styles from "../style/some.module.scss"

export default function Collection() {
    const { data: signer } = useSigner();

    const [contractMarketplace, setContractMarketplace] = useState();
    const [contractDeploy, setContractDeploy] = useState();
    const [err, setErr] = useState();
    const [isLoading, setIsLoading] = useState();

    useEffect(() => {
        if (signer) {
            const _contractMarketplace = new ethers.Contract(
            '0xba26F9957cF575EA6a3f6eBf4bdBe16578ac804B',
            marketplaceABI,
          signer
            );

            const _contractDeploy = new ethers.Contract(
            '0x99035705b03BB153B32A6C7dD1e634356aa5a16f',
            deployABI,
            signer
            );

            setContractMarketplace(_contractMarketplace);
            setContractDeploy(_contractDeploy);
        }
    }, [signer]);

    const schema = yup.object().shape({
        Collection: yup.string().min(1).max(15).required("Collection name required"),
        Symbol: yup.string().min(1).max(6).required("Collection symbol required"),
    });

    const {register, handleSubmit} = useForm({
        resolver: yupResolver(schema),
    });

    const handleCreateCollection = async (data) => {
        setIsLoading(true);
        setErr(false);

        try {
            // Deploying nft contract and getting it's address
            const tx1 = await contractDeploy.createToken(data.Collection, data.Symbol);
            await tx1.wait();
            const address = await contractDeploy.lastDeployedContract();

            // Adding deplyoed nft contract to martketplace
            const tx2 = await contractMarketplace.addCollection(address);
            await tx2.wait();
        } 
        catch (e) {
            setErr("e: " + e);
        } 
        finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
                <form className={styles.form_wrapper} onSubmit={handleSubmit((data) => handleCreateCollection(data))}>
                    <input type="text" placeholder="Collection name" {...register("Collection")}/>
                    <input type="text" placeholder="Symbol" {...register("Symbol")}/>
                    <Button className={styles.btn_wrapper} loading={isLoading} type="submit" placeholder="Create collection"> Create collection </Button> 
                </form>
                {err && <div> {err} </div>}
        </div>
    )
}