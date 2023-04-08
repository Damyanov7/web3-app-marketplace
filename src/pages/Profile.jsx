import React, { useState, useEffect } from 'react';
import { useSigner } from 'wagmi';
import { ethers } from 'ethers';
import {useLocation} from 'react-router-dom';

import marketplaceABI from '../abi/Marketplace.json';
import nftABI from '../abi/NFT.json';
import NftComp from '../components/ui/NftComp';

function Profile() {
  const [nftInfo, setNftInfo] = useState();
  const [contractMarketplace, setContractMarketplace] = useState();
  let location = useLocation();

  const { data: signer } = useSigner();

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

  useEffect(() => {
        if (contractMarketplace) {
            getNft();
        }
    }, [contractMarketplace,]);

  async function getNft() {
    const arr = [];
    const nftCount = await contractMarketplace.itemCount();

    try {
      for (let i = 1; i <= nftCount; i++) {
        console.log(i);
        const marketplaceItem = await contractMarketplace.item(i); // Getting marketplace info for nft
        const nftIdInCollection = marketplaceItem[2]; // Getting the tokenId in the nft collection
        const nftContract = new ethers.Contract(
          marketplaceItem[0], // Collection address
          nftABI,
          signer
        );

        const collectionName = await nftContract.name();
        const uri = await nftContract.tokenURI(nftIdInCollection); // Fetching URI from blockchain
        await fetch(uri).then((res) => res.json()).then((data) => {
          arr.push({
            img: data.imgUri,
            name: data.name,
            description: data.description,
            owner: marketplaceItem[1],
            tokenId: marketplaceItem[2],
            collection: collectionName,
            forSell: marketplaceItem[4],
            price: marketplaceItem[3],
            marketplaceTokenId: i
          });
        });
      }
      setNftInfo(arr);
    } catch(e) {
      console.log("error: " + e);
    } 
  }

  return (
    <div className="container my-5">
      {nftInfo && 
        nftInfo
        .map((element, index) =>{
            console.log();
            if(location.state.owner === element.owner)
                return (
                    <div key = {index}>
                        <NftComp            
                        image = {element.img}
                        name = {element.name}
                        description = {element.description}
                        owner = {element.owner}
                        collection = {element.collection}
                        forSale = {element.forSell}
                        price = {element.price}
                        tokenId = {element.marketplaceTokenId}
                        />
                    </div>
                )
            else
                    return;
        }
        )
      }


       
    </div>
  );
}

export default Profile;
