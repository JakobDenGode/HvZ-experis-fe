import React from "react";
import { createContext, useContext, useState } from "react";
import { STORAGE_KEY_USER } from "../const/storageKeys";
import { storageRead } from "../utils/storage";

const PlayerContext = createContext();

export const useUser = () => {
  return useContext(PlayerContext);
};

const PlayerProvider = ({ children }) => {
  const [player, setPlayer] = useState(storageRead(STORAGE_KEY_USER));

  const state = {
    player,
    setPlayer,
  };

  return (
    <PlayerContext.Provider value={state}>{children}</PlayerContext.Provider>
  );
};

export default PlayerProvider;