import React, { useState, useEffect } from "react";
import { useSigner } from "wagmi";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import Button from "./Button";
import marketplaceABI from "../../abi/Marketplace.json";
import nftABI from "../../abi/NFT.json";
import styles from "../../style/some.module.scss";

const SingleNft = ({
  image,
  name,
  description,
  owner,
  collection,
  forSale,
  price,
  tokenId,
  contract
}) => {
  const [price1, setPrice] = useState();
  const [contractMarketplace, setContractMarketplace] = useState();
  const [contractNFT, setContractNFT] = useState();
  const [isLoading, setIsLoading] = useState();
  const { data: signer } = useSigner();

  const state = {
    image: image,
    name: name,
    description: description,
    owner: owner,
    contract: contract,
    collection: collection,
    forSale: forSale,
    price: price,
    tokenId: tokenId
  };

  // Connecting to marketplace contract
  useEffect(() => {
    if (signer) {
      const _contractMarketplace = new ethers.Contract(
        "0xba26F9957cF575EA6a3f6eBf4bdBe16578ac804B",
        marketplaceABI,
        signer
      );

      const _contractNFT = new ethers.Contract(
        contract,
        nftABI,
        signer
      );

      setContractNFT(_contractNFT);
      setContractMarketplace(_contractMarketplace);
    }
  }, [signer]);

  async function buyNft(tokenId) {
    setIsLoading(true);

    try {
      const tx = await contractMarketplace.buyItem(tokenId, {
        value: price.toString()
      });
      await tx.wait();

      const isMarketplaceApproved = await contractNFT.isApprovedForAll(signer._address, contractMarketplace.address);
      if (!isMarketplaceApproved) {
        const tx2 = await contractNFT.setApprovalForAll(
          contractMarketplace.address,
          true
        );
        await tx2.wait();
      }

    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  }

  function getPriceInWei(price1) {
    if (price1[1] !== '.')
      throw new Error("Error: Input format is incorrent");
    else return price1[0] + price1[2] + "00000000000000000";
  }

  async function sellNft(tokenId, price1) {
    setIsLoading(true);

    try {
      const tx = await contractMarketplace.sellItem(tokenId, ethers.BigNumber.from(getPriceInWei(price1))); // umm, I know this needs to be done in a different way :D
      await tx.wait();
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.nft}>
      <Link to="/Nft" state={state}> 
        <img alt="Nft" src={image} /> 
      </Link>

      <div>name: {name}</div>
      <div>description: {description}</div>

      <Link to="/profile"state={{owner: owner,}}> 
        owner: {owner.substr(0, 4) + "..." + owner.substr(-4, 4)} 
      </Link>

      <Link to="/collection-sort" state={{ contract: contract, }}>
        collection: {collection}
      </Link>

      {forSale && signer._address !== owner && (
        <Button
          loading={isLoading}
          onClick={() => buyNft(tokenId)}
          type="submit"
          placeholder=""
          className={styles.btn_wrapper}
        >
          {" "}Buy for {ethers.utils.formatEther(price._hex, 18)} ETH{" "}
        </Button>
      )}

      {!forSale && signer._address === owner && (
        <div>
          <input
            placeholder="price"
            onChange={(e) => setPrice(e.target.value)}
          ></input>
          <Button
            loading={isLoading}
            onClick={() => sellNft(tokenId, price1)}
            type="submit"
            placeholder=""
            className={styles.btn_wrapper}
          >
            {" "}
            Sell{" "}
          </Button>
        </div>
      )}

    </div>
  );
};

export default SingleNft;
