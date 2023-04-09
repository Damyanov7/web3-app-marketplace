import React, { useState, useEffect } from "react";
import { useSigner } from "wagmi";
import { ethers } from "ethers";
import { useLocation } from "react-router-dom";
import marketplaceABI from "../abi/Marketplace.json";
import nftABI from "../abi/NFT.json";
import SingleNft from "../components/ui/SingleNft";

import styles from "../style/some.module.scss";

function Profile() {
  const [nftInfo, setNftInfo] = useState();
  const [contractMarketplace, setContractMarketplace] = useState();
  let location = useLocation();

  const { data: signer } = useSigner();

  // Connecting to marketplace contract
  useEffect(() => {
    if (signer) {
      const _contractMarketplace = new ethers.Contract(
        "0xba26F9957cF575EA6a3f6eBf4bdBe16578ac804B",
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
  }, [contractMarketplace]);

  async function fetchNfts() {
    const nftHolder = [];
    const nftCount = await contractMarketplace.itemCount();
    console.log(location.state)

    try {
      for (let i = 1; i <= nftCount; i++) {
        const nftData = await contractMarketplace.item(i);
        const nftIdInCollection = nftData[2];
        const nftContract = new ethers.Contract(
          nftData[0], // Collection address
          nftABI,
          signer
        );

        const collectionName = await nftContract.name();
        const uri = await nftContract.tokenURI(nftIdInCollection); // Fetching URI from blockchain
        await fetch(uri)
          .then((res) => res.json())
          .then((data) => {
            nftHolder.push({
              img: data.imgUri,
              name: data.name,
              description: data.description,
              owner: nftData[1],
              tokenId: nftData[2],
              collection: collectionName,
              contract: nftData[0],
              forSell: nftData[4],
              price: nftData[3],
              marketplaceTokenId: i,
            });
          });
      }
      setNftInfo(nftHolder);
    } catch (e) {
      console.log("fetchNfts: " + e);
    }
  }

  return (
    <div className={`container my-5 ${styles.nft_wrapper}`}>
      {nftInfo &&
        nftInfo.map((element, index) => {
          if (location.state.owner === element.owner)
          return(
          <div key={index}>
            <SingleNft
              image={element.img}
              name={element.name}
              description={element.description}
              owner={element.owner}
              collection={element.collection}
              forSale={element.forSell}
              price={element.price}
              tokenId={element.marketplaceTokenId}
              contract={element.contract}
            />{" "}
          </div>
          );
          })}
    </div>
  );
}

export default Profile;
