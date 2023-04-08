import {useLocation} from 'react-router-dom';
import Button from '../components/ui/Button';

const NftPage = () => {
   let location = useLocation();
   console.log(location);
   return (
      <div>
         <div>
        <img
         src={location.state.image}
         style={{ maxWidth: "200px", margin: "15px" }}
         />
   
     
      <br/>
      name: {location.state.name}
      <br/>
      description: {location.state.description}
      <br/>
      owner: {location.state.owner}
      <br/>
      collection: {location.state.collection}
      <br/>
      { location.state.forSale &&
         <Button onClick={()=> {}} type="submit" placeholder=""> Buy for {parseInt(location.state.price._hex)} ETH </Button> }
      { !location.state.forSale &&
      <div>
         <input placeholder="price" onChange={(e) => {}}></input>
         <Button onClick={() => {}} type="submit" placeholder="Create collection"> Sell </Button> 
      </div>
      }
     
      </div>
         {location.state.from}
      </div>
   );
};

export default NftPage;