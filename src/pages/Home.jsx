import React, { useState, useEffect } from 'react';
import { useSigner } from 'wagmi';
import { ethers } from 'ethers';

import marketplaceABI from '../abi/Marketplace.json';
import nftABI from '../abi/NFT.json';
import NftComp from '../components/ui/NftComp';

export default function Home() {
   const [nftInfo, setNftInfo] = useState();
   const [contractMarketplace, setContractMarketplace] = useState();
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
         fetchNfts();
      }
   }, [contractMarketplace,]);

   async function fetchNfts() {
      const nftHolder = [];
      const nftCount = await contractMarketplace.itemCount();

      try {
         for (let i = 1; i <= nftCount; i++) {
            console.log(i);
            const nftData = await contractMarketplace.item(i); 
            const nftIdInCollection = nftData[2]; 
            const nftContract = new ethers.Contract(
               nftData[0], // Collection address
               nftABI,
               signer
            );

            const collectionName = await nftContract.name();
            const uri = await nftContract.tokenURI(nftIdInCollection); // Fetching URI from blockchain
            await fetch(uri).then((res) => res.json()).then((data) => {
            nftHolder.push({
               img: data.imgUri,
               name: data.name,
               description: data.description,
               owner: nftData[1],
               tokenId: nftData[2],
               collection: collectionName,
               forSell: nftData[4],
               price: nftData[3],
               marketplaceTokenId: i
            });
            });
         }
         setNftInfo(nftHolder);
      } catch(e) {
         console.log("fetchNfts: " + e);
      } 
   }

   return (
   <div className="container my-5">
   {nftInfo &&
   nftInfo
   .map((element, index) => 
   (
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
      )
   }
   </div>
   );
   
}