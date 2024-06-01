import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { CHECK_USER_EXISTS } from "../../utils/queries";
import { CREATE_USER, LOGIN } from "../../utils/mutations";
import CookieAuth from '../../utils/auth'
import "../../../public/css/style.css";

export default function Signup() {
  const [errorMessage, setErrorMessage] = useState("");
  const [createUser] = useMutation(CREATE_USER);
  const [login] = useMutation(LOGIN);
  const [signUp, setSignUp] = useState({
    first: "",
    last: "",
    username: "",
    email: "",
    password: "",
    password2: "",
  });

  const { loading: queryLoading, error: queryError, data: queryData } = useQuery(CHECK_USER_EXISTS, {
    skip: !signUp.username && !signUp.email,
    variables: {
      usernameOrEmail: signUp.username || signUp.email,
    },
    onError: (error) => {
      console.error("Error fetching user:", error.message);
    },
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

  function validatePassword(): boolean {
    return regex.test(signUp.password);
  }

  function checkPasswords(password: string, password2: string) {
    return password === password2;
  }

  async function handleSubmit() {
    if (queryData && (queryData.userExists || queryData.emailExists)) {
        if (queryData.userExists) {
          return setErrorMessage("Error: Username already exists");
        }
        if (queryData.emailExists) {
          return setErrorMessage("Error: Email already exists");
        }
      }
    if (validatePassword() !== true)
      return setErrorMessage(
        "Error: Password must have a capitol letter, one or more numbers and symbols as well as be 9 or more digits long."
      );

    if (!checkPasswords(signUp.password, signUp.password2))
      return setErrorMessage("Passwords must match.");
    
    const addedUser = await createUser({
        variables: {
          firstName: signUp.first,
          lastName: signUp.last,
          username: signUp.username,
          email: signUp.email,
          password: signUp.password,
        },
      });
    if(addedUser){
    const { data } = await login({
        variables: { username: signUp.username,  password: signUp.password },
    });
    CookieAuth.login(data.login.token);
}
}

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
