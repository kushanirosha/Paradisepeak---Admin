

import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from 'axios'
import ApiService from "../services/ApiService";

const ForgotPassword: React.FC = () => {
const [success, setSuccess] = useState("");
const [error, setError] = useState('')
// const navigate = useNavigate();
const [searchParams] = useSearchParams();
const id = searchParams.get("id");
const token = searchParams.get("token");
const [values, setValues]= useState({
        newpassword:'',
        confirmpassword:''
    })
    const handlerest = async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        const requestData = {
          ...values,
          id: id,
          token:token,
        };
           const userData = await ApiService.restPassword(requestData);
          //  console.log(userData.message);
              setSuccess(userData.message);
              setTimeout(() => setSuccess(''), 5000);
              setValues({
                newpassword: '',
                confirmpassword: '',
              });
              // navigate("/");
            } catch (err: unknown) {
              if (axios.isAxiosError(err)) {
                console.log(err.response?.data?.message)
                // Axios error
                setError(err.response?.data?.message);
              } else if (err instanceof Error) {
                setError(err.message);
              } else {
                setError("An unexpected error occurred");
              }
          
              setTimeout(() => setError(''), 5000);
            }
          };  
 
    
  return (
    <>
    
    <div className="reset-container">
        <div >
        <div className="siginup-grid">
           <form onSubmit={handlerest}>
           {success && <p className="success-message">{success}</p>}
                {error && <p className="error-message">{error}</p>}
            <h1>
            Reset  Password
            </h1>
           
            <div>
               <div className="reset">
                <label htmlFor="">Password</label>
                <input type="password" name="password" placeholder='Password' onChange={e => setValues({...values, newpassword: e.target.value})}/>
                </div>
                <div className='reset'>
                <label htmlFor="">Confirm Password</label>
                <input type="password" name="password" placeholder='Password' onChange={e => setValues({...values, confirmpassword: e.target.value})}/>
                </div>
             </div>
               
                <div className='signup-form-actions'>
                <button className='btn btn-success'>Set Password</button>
                </div>
            </form>
            <div>
              
            
            </div>
           
           </div>
        </div> 

    </div>
   
   
    </>

     

     
  );
};

export default ForgotPassword;
