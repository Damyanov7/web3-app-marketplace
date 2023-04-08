import React, { useState, useEffect, useCallback } from 'react';
import { useSigner, useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';

import Button from './Button';
import marketplaceABI from '../../abi/Marketplace.json';

const NftComp = ({
   i,
  image,
  name,
  description,
  owner,
  collection, 
  forSale, 
  price, 
  tokenId
}) => {
   const [price1, setPrice] = useState();
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

   async function buyNft(tokenId) {
      try {
         const tx = await contractMarketplace.buyItem(tokenId, { value: ethers.utils.parseEther(JSON.stringify(parseInt(price._hex)))});
         await tx.wait();
      } catch(e) {
         console.log(e);
      }
   }

   async function sellNft(tokenId, price1) {
      try {
         const tx = await contractMarketplace.sellItem(tokenId, price1);
         await tx.wait();
      } catch(e) {
         console.log(e);
      }
   }

   return (
      <div>
         <Link to="/NftPage" state={{ 
            image: image,
            name: name,
            description: description,
            owner:owner,
            collection:collection, 
            forSale:forSale, 
            price:price 
         }}>
         <img
            src={image}
            style={{ maxWidth: "200px", margin: "15px" }}
            />
         </Link>
         <br/>
         name: {name}
         <br/>
         description: {description}
         <br/>

         <Link to="/profile" state={{ 
            owner:owner,  
            }}>
            owner: {owner.substr(0, 4) + "..." + owner.substr(-4, 4)}
         </Link>
         <br/>
         collection: {collection}
         <br/>

         { 
            forSale && (signer._address !== owner) &&
            <Button onClick={() => buyNft(tokenId)} type="submit" placeholder=""> Buy for {parseInt(price._hex)} ETH </Button>
         }

         { 
            !forSale && (signer._address === owner) &&
            <div>
               <input placeholder="price" onChange={(e) => setPrice(e.target.value)}></input>
               <Button onClick={() => sellNft(tokenId, price1)} type="submit" placeholder="Create collection"> Sell </Button> 
            </div>
         }
         
      </div>
   );
};

export default NftComp;