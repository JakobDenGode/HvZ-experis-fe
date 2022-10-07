import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Heading from "../common/Heading";
import GameList from "../components/game-list/GameList";

const LandingPage = () => {
  const {
    loginWithRedirect,
    loginWithPopup,
    logout,
    isAuthenticated,
    isLoading,
    user,
    getIdTokenClaims,
  } = useAuth0();

  /*if (user) {
    console.log(user["http://mynamespace/roles"].pop());
  }*/
  console.log(user);

  /* 
  if (isLoading) {
    return <p>loading...</p>;
  }

  Move the button or the login elements to another component */

  const [games2, setGames2] = useState([]);

  const apiUrl = "https://hvz-api-noroff.herokuapp.com/game";

  useEffect(() => {
    const findGames = async () => {
      try {
        const response = await fetch(`${apiUrl}`);
        //if (!response.ok) throw new Error("Could not complete request");
        console.log(response);
        const data = await response.json();
        console.log(data);
        //setGames2(data);
        return [null, data];
      } catch (error) {
        return [error.message, []];
      }
    };
    findGames();
  }, [apiUrl]);

  const games = [
    {
      name: "Knoll",
      age: 4,
      id: 1,
    },
    {
      name: "Tott",
      age: 3,
      id: 2,
    },
  ];

  console.log(isAuthenticated);

  return (
    <>
      <div>
        <Heading title="Games" />
        <GameList games={games} />
      </div>
      {isAuthenticated && (
        <>
          <div>
            <img src={user.picture} alt={user.name} />
            <h2>{user.name}</h2>
            <p>{user.sub}</p>
          </div>
          <button onClick={() => logout({ returnTo: window.location.origin })}>
            Log Out
          </button>
        </>
      )}
      {!isAuthenticated && (
        <button onClick={() => loginWithRedirect()}>Log In</button>
      )}
    </>
  );
};
export default LandingPage;

/*
{
  isAuthenticated && (
    <div>
      <img src={user.picture} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
    <button onClick={() => loginWithRedirect()}>Log In</button>
  );
}
*/
