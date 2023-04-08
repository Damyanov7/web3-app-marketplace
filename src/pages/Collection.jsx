import { ethers } from 'ethers';
import { useSigner } from 'wagmi';
import { useForm } from "react-hook-form"
import {yupResolver} from "@hookform/resolvers/yup"

import * as yup  from "yup";
import React, { useState, useEffect } from 'react';
import marketplaceABI from '../abi/Marketplace.json';
import deployABI from '../abi/Deployment.json';
import Button from '../components/ui/Button';
import styles from "../style/plamen.module.scss"

export default function Collection() {
    const { data: signer } = useSigner();

    const [contractMarketplace, setContractMarketplace] = useState();
    const [contractDeploy, setContractDeploy] = useState();
    const [err, setErr] = useState();
    const [isLoading, setIsLoading] = useState();

    useEffect(() => {
        if (signer) {
            const _contractMarketplace = new ethers.Contract(
            '0xed5E4ce403ffA04db1b6Cb1EAa01F33EE28C499b',
            marketplaceABI,
            signer
            );

            const _contractDeploy = new ethers.Contract(
            '0xEb732590445D242df43d3a1f679D5120f5F02F81',
            deployABI,
            signer
            );

            setContractMarketplace(_contractMarketplace);
            setContractDeploy(_contractDeploy);
        }
    }, [signer]);

    const schema = yup.object().shape({
        Collection: yup.string().min(1).max(15).required("Collection name required"),
        Description: yup.string().min(1).max(6).required("Collection description required"),
    });

    const {register, handleSubmit, formState} = useForm({
        resolver: yupResolver(schema),
    });

    const handleCreateCollection = async (data) => {
        setIsLoading(true);
        setErr(false);

        try {
            // Deploying nft contract and getting it's address
            const tx1 = await contractDeploy.createToken(data.Collection, data.Description);
            await tx1.wait();
            const address = await contractDeploy.lastDeployedContract();

            // Adding deplyoed nft contract to martketplace
            const tx2 = await contractMarketplace.addCollection(address);
            await tx2.wait();
        } 
        catch (e) {
            setErr("e: " + e + "e.reason: "+ e.reason);
        } 
        finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <form className={styles.wrapperPlamen} onSubmit={handleSubmit((data) => handleCreateCollection(data))}>
                <input type="text" placeholder="Collection name" {...register("Collection")}/>
                <input type="text" placeholder="Description" {...register("Description")}/>
                <Button className={styles.btnPlamen} loading={isLoading} type="submit" placeholder="Create collection"> Create collection </Button> 
            </form>
            {err && <div> {err} </div>}
        </div>
    )
}