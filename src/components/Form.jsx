import { useForm } from "react-hook-form"
import {yupResolver} from "@hookform/resolvers/yup"
import * as yup  from "yup";

import {createCollection} from "../sdk/createCollection";

export function Form() {

    const schema = yup.object().shape({
        Collection: yup.string().min(1).max(15).required("Collection name required"),
        Description: yup.string().min(1).max(6).required("Collection description required"),
    });

    const {register, handleSubmit, formState} = useForm({
        resolver: yupResolver(schema),
    });

    return (
      <div>
         <form onSubmit={handleSubmit((data) => createCollection(data))}>
            <input type="text" placeholder="Collection name" {...register("Collection")}/>
            <br/>
            <input type="text" placeholder="Description" {...register("Description")}/>
            <br/>
            <input type="submit" placeholder="Create collection"/> 
         </form>
      </div>
   )
}