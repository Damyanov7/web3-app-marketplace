import { useLocation } from "react-router-dom";
import Button from "../components/ui/Button";

import styles from "../style/some.module.scss";

const Nft = () => {
  let location = useLocation();

  return (
    <div className={`container ${styles.single_nft}`}>
      {/* <img alt="nft" src={location.state.image} />
      <div className={styles.nft_info}>
        <div>name: {location.state.name}</div>
        <div>description: {location.state.description}</div>
        <div>owner: {location.state.owner}</div>
        <div>collection: {location.state.collection}</div>
        {location.state.forSale && (
          <Button
            onClick={() => {}}
            type="submit"
            placeholder=""
            className={styles.btn_wrapper}
          >
            {" "}
            Buy for {parseInt(location.state.price._hex)} ETH{" "}
          </Button>
        )}

        {!location.state.forSale && (
          <div>
            <input placeholder="price" onChange={(e) => {}}></input>
            <Button
              onClick={() => {}}
              type="submit"
              placeholder="Create collection"
              className={styles.btn_wrapper}
            >
              {" "}
              Sell{" "}
            </Button>
          </div>
        )}

        {location.state.from}
      </div> */}
    </div>
  );
};

export default Nft;
