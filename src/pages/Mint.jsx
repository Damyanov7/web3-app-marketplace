import React, { useState, useEffect } from 'react';
import { create as ipfsHttpClient } from "ipfs-http-client";
import { ethers } from 'ethers';
import { useSigner } from 'wagmi';
import { useForm } from "react-hook-form"
import {yupResolver} from "@hookform/resolvers/yup"
import * as yup  from "yup";

import Button from '../components/ui/Button';
import nftABI from '../abi/NFT.json';
import marketplaceABI from '../abi/Marketplace.json';
import styles from "../style/plamen.module.scss"

const projectId = "2NxpSWohJFtR8xHU6XAeGcygruP";
const projectSecretKey = "c6cd12970a83bf07febdfed09f69a112";
const authorization = "Basic " + btoa(projectId + ":" + projectSecretKey);

export default function Mint() {
    const [uploadedImages, setUploadedImages] = useState({});
    const [contractMarketplace, setContractMarketplace] = useState();
    const [contractNFT, setContractNFT] = useState();
    const [err, setErr] = useState("NoErrors");
    const [isLoading, setIsLoading] = useState();
    const [collections, setCollections] = useState();
    const [addresses, setAddresses] = useState(0);

    const { data: signer } = useSigner();

    const ipfs = ipfsHttpClient({
        url: "https://ipfs.infura.io:5001/api/v0",
        headers: {
            authorization,
        },
    });

    // Form stuff
    const schema = yup.object().shape({
        // TODO
    });
    const {register, handleSubmit, formState} = useForm({
        resolver: yupResolver(schema),
    });
    
    // Connecting to marketplace contract
    useEffect(() => {
        if (signer) {
            const _contractMarketplace = new ethers.Contract(
            '0xed5E4ce403ffA04db1b6Cb1EAa01F33EE28C499b',
            marketplaceABI,
            signer
            );

            setContractMarketplace(_contractMarketplace);
        }
    }, [signer]);

    const getCollections = async () => {
        const arr = [];
        const addresses1 = new Map();

        try {
            const numberOfCollections = await  contractMarketplace.collectionCount();
            
            for (let i = 0; i <= numberOfCollections; i++) {
                const address = await contractMarketplace.collection(i);

                if(address != 0) {
                    const collection = new ethers.Contract(
                        address,
                        nftABI,
                        signer
                    );

                    const name = await collection.name();
                    arr.push(name);
                    addresses1.set(name, address);
                }
            }
            setCollections(arr);
            setAddresses(addresses1);
        } catch (e) {
            console.log(e);
        } 
    }

    useEffect(() => {
        if (contractMarketplace) {
            getCollections();
        }
    }, [contractMarketplace,]);

    // Function to connect to NFT/Collection contract
    const updateNft = (event) => {
        if (signer) {
            setContractNFT(new ethers.Contract(
                addresses.get(event.target.value),
                nftABI,
                signer
            ));
        }
    }

    const onSubmitHandler = async (event) => {
        setIsLoading(true);

        try {
            const files = event.file;

            if (!files || files.length === 0) {
                return alert("No files selected");
            }

            const file = files[0];
            const result = await ipfs.add(file);

            const nftData = {
                imgUri: "https://skywalker.infura-ipfs.io/ipfs/" + result.path,
                name: event.name,
                description: event.description
            }
            
            // Uploading img-uri, NFT name, NFT description to IPFS
            const nftUri = await ipfs.add(JSON.stringify(nftData));

            setUploadedImages(
                {
                    cid: nftUri.cid,
                    path: nftUri.path,
                }
            );
            
            // Miting NFT to sender
            const uri = "https://skywalker.infura-ipfs.io/ipfs/" + nftUri.path;
            const tx = await contractNFT.safeMint(uri, signer._address);
            await tx.wait();

            // Adding the minted NFT to the marketplace
            const tokenId = await contractNFT._tokenIdCounter();
            console.log("TokenID: " + tokenId);
            const tx2 = await contractMarketplace.addItem(contractNFT.address, tokenId);
            await tx2.wait();

            // Giving permissions to marketplace to be able to handle operations with the NFT
            const tx3 = await contractNFT.setApprovalForAll(contractMarketplace.address, true); 
            await tx3.wait();
        } catch (e) {
            setErr(e);
            console.log("onSubmiteHandler: " + e);
        } finally {
            setIsLoading(false);
        }  
    };

    return (
        <div>
            {ipfs ? (
                <div className="container">
                    <h5 className = {styles.wrapperPlamen1}> Mint </h5>
                    <form className={styles.wrapperPlamen} onSubmit={handleSubmit(onSubmitHandler)}>
                        <input type="file" name="image" {...register("file")}/>
                        <input placeholder="name" type="text" name="name" {...register("name")}/>
                        <input placeholder="description" type="text" name="description" {...register("description")}/>
                        <select onChange={(e) => updateNft(e)}>
                            {collections && collections.map((element, index) => 
                            (
                            <option key={index} value={element}>{element}</option>
                            )
                            )}
                        </select>
                        <br />
                        <Button className={styles.btnPlamen} loading={isLoading} type="submit" placeholder="Mint nft item"> Mint </Button> 
                    </form>
                </div>
            ) : null}

            {/* {uploadedImages.path != null ? (
                <>
                <h4>Link to IPFS:</h4>
                <a href={"https://skywalker.infura-ipfs.io/ipfs/" + uploadedImages.path}>
                    <h3>{"https://skywalker.infura-ipfs.io/ipfs/" + uploadedImages.path}</h3>
                </a>
                </> ) : null 
            } */}
            {err && <div> {err.reason} </div>}
        </div>
    )
}