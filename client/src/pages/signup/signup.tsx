import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation } from "@apollo/client";
import { debounce } from "lodash";
import { CHECK_USER_EXISTS } from "../../utils/queries";
import { CREATE_USER } from "../../utils/mutations";
import CookieAuth from '../../utils/auth';
import "../../../public/css/style.css";

export default function Signup() {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState("");
  const [createUser] = useMutation(CREATE_USER);
  const [signUp, setSignUp] = useState({
    first: "",
    last: "",
    username: "",
    email: "",
    password: "",
    password2: "",
  });

  const [existingUsername, setExistingUsername] = useState(null);
  const [existingEmail, setExistingEmail] = useState(null);

  const { data: usernameQueryData } = useQuery(CHECK_USER_EXISTS, {
    variables: { usernameOrEmail: signUp.username },
    skip: !signUp.username,
  });

  const { data: emailQueryData } = useQuery(CHECK_USER_EXISTS, {
    variables: { usernameOrEmail: signUp.email },
    skip: !signUp.email,
  });

  const regex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{9,}$/;

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setSignUp((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const debouncedCheck = useCallback(
    debounce<any>((usernameData: any, emailData: any) => {
      setExistingUsername(usernameData);
      setExistingEmail(emailData);
    }, 500),
    []
  );

  useEffect(() => {
    if (usernameQueryData) {
      setExistingUsername(usernameQueryData);
      
    } else {
        setExistingUsername(null)
      }
    if (emailQueryData && !usernameQueryData) {
      setExistingEmail(emailQueryData);
    } else {
      setExistingEmail(emailQueryData);
    }
    debouncedCheck(usernameQueryData, emailQueryData);
  }, [usernameQueryData, emailQueryData, debouncedCheck]);

  function validatePassword(): boolean {
    return regex.test(signUp.password);
  }

  function checkPasswords(password: string, password2: string) {
    return password === password2;
  }

  const handleSubmit = async () => {

    if (existingEmail !== undefined || existingUsername !== undefined) {
      setErrorMessage(
        existingUsername ? "Username already exists" : "Email already exists"
      );
      return;
    }

    if (!validatePassword()) {
      setErrorMessage(
        "Password must have a capital letter, one or more numbers and symbols as well as be 9 or more digits long."
      );
      return;
    }

    if (!checkPasswords(signUp.password, signUp.password2)) {
      setErrorMessage("Passwords must match.");
      return;
    }

    try {
      const { data } = await createUser({
        variables: {
          firstName: signUp.first.toLowerCase(),
          lastName: signUp.last.toLowerCase(),
          username: signUp.username.toLowerCase(),
          email: signUp.email.toLowerCase(),
          password: signUp.password,
        },
      }).catch((error)=>{
        throw "Error from createUser:"+error
      })
      
      CookieAuth.login(JSON.stringify(data.createUser.token))
      
      if (data.createUser.token) {
        console.log('Login successful:', data);
        navigate('/')
      } else {
        setErrorMessage("Error: Try again later (1)");
      }

    } catch (err) {
      setErrorMessage("Error: Try again later (2)");
      console.log(existingEmail, existingUsername)
      throw err
    }
  };

  return (
    <div className="login">
      <h1>Sign Up</h1>
      <div>First Name</div>
      <input
        type="text"
        name="first"
        value={signUp.first}
        onChange={handleInputChange}
      />
      <div>Last Name</div>
      <input
        type="text"
        name="last"
        value={signUp.last}
        onChange={handleInputChange}
      />
      <div>Username</div>
      <input
        type="text"
        name="username"
        value={signUp.username}
        onChange={handleInputChange}
      />
      <div>Email</div>
      <input
        type="email"
        name="email"
        value={signUp.email}
        onChange={handleInputChange}
      />
      <div>Password</div>
      <input
        type="password"
        name="password"
        value={signUp.password}
        onChange={handleInputChange}
      />
      <div>Double Check Password</div>
      <input
        type="password"
        name="password2"
        value={signUp.password2}
        onChange={handleInputChange}
      />
      <button onClick={handleSubmit}>Submit</button>
      {errorMessage && <h2>{errorMessage}</h2>}
    </div>
  );
}
