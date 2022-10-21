import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvent,
  Rectangle,
  Tooltip,
  LocationMarker,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { createHeaders } from "../admin/CreateHeaders";
import { useAuth0 } from "@auth0/auth0-react";
import { useMapCords, usePlayer } from "../../context/PlayerContext";
import HeaderNavBar from "../nav/HeaderNavBar";
import { divIcon } from "leaflet";
import { Button } from "react-bootstrap";
import { showBiteCode } from "../player/ShowBiteCode";
import { storageSave } from "../../utils/storage";
import {
  STORAGE_KEY_MAPCORDS,
  STORAGE_KEY_PLAYER,
} from "../../const/storageKeys";

function Map() {
  const { getAccessTokenSilently } = useAuth0();
  const gameId = useParams();
  const { player, setPlayer } = usePlayer();
  const [gameData, setGame] = useState([]);
  const [cords, setCords] = useState([]);
  const [missionCords, setMissionCords] = useState([]);
  const [getRectangle, setRectangle] = useState([
    [0, 0],
    [0, 0],
  ]);
  const [killCords, setKillCords] = useState([]);
  const { mapCords, setMapCords } = useMapCords();

  console.log("her-----");
  console.log(mapCords);

  //styling for missions
  const fillZombie = { fillColor: "red" };
  const fillHuman = { fillColor: "blue" };

  //Option 1
  //https://img.icons8.com/color/344/headstone--v1.png
  //Option 2
  //https://img.icons8.com/external-justicon-lineal-color-justicon/344/external-zombie-halloween-justicon-lineal-color-justicon-1.png
  //styling for tombstone marker
  const tombstone = L.icon({
    iconUrl:
      "https://img.icons8.com/external-justicon-lineal-color-justicon/344/external-zombie-halloween-justicon-lineal-color-justicon-1.png",
    iconSize: [35, 35], // size of the icon
    iconAnchor: [35, 35], // point of the icon which will correspond to marker's location
    popupAnchor: [-10, -15], // point from which the popup should open relative to the iconAnchor
  });

  //styling for mission Icon
  const missionIcon = L.icon({
    iconUrl: "https://img.icons8.com/doodle/344/filled-flag.png",
    iconSize: [35, 35], // size of the icon
    iconAnchor: [35, 35], // point of the icon which will correspond to marker's location
    popupAnchor: [-10, -15], // point from which the popup should open relative to the iconAnchor
  });

  //Get game
  useEffect(() => {
    const findGames = async () => {
      const accessToken = await getAccessTokenSilently();
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_SERVER_URL}games/${gameId.gameId}`,
          { headers: createHeaders(accessToken) }
        );

        const data = await response.json();
        setGame(data);
        //get coordinates for marker
        setCords([data.nw_lat, data.nw_lng]);
        //get coordinates to draw rectangle
        setRectangle([
          [data.nw_lat, data.nw_lng],
          [data.se_lat, data.se_lng],
        ]);
        return [null, data];
      } catch (error) {
        return [error.message, []];
      }
    };
    findGames();
  }, []);

  //Get missions
  useEffect(() => {
    const findMissions = async () => {
      const accessToken = await getAccessTokenSilently();
      try {
        const response = await fetch(
          `https://hvz-api-noroff.herokuapp.com/api/v1/games/${gameId.gameId}/missions/${player.id}`,
          { headers: createHeaders(accessToken) }
        );

        const data = await response.json();

        setMissionCords(data);

        return [null, data];
      } catch (error) {
        return [error.message, []];
      }
    };
    findMissions();
  }, []);

  //Function to get all mission markers
  function MultipleMarkers() {
    const map = useMapEvent({
      click() {
        map.locate();
      },
    });
    return missionCords.map((item) => {
      return (
        <Marker
          position={[item.missionLat, item.missionLng]}
          icon={missionIcon}
        >
          <Popup>
            <b>Mission</b>
            <br></br>
            {item.missionName} <br></br> {item.missionDescription}
          </Popup>
        </Marker>
      );
    });
  }

  //Get all kills in a game
  useEffect(() => {
    const findKills = async () => {
      const accessToken = await getAccessTokenSilently();
      try {
        const response = await fetch(
          `https://hvz-api-noroff.herokuapp.com/api/v1/games/${gameId.gameId}/kills`,
          { headers: createHeaders(accessToken) }
        );
        const data = await response.json();
        setKillCords(data);
        return [null, data];
      } catch (error) {
        return [error.message, []];
      }
    };
    findKills();
  }, []);

  //Function to get all tombstones where players have been killed
  function MultipleTombstoneMarkers() {
    const map = useMapEvent({
      click() {
        map.locate();
      },
    });

    return killCords.map((killItem) => {
      return (
        <Marker icon={tombstone} position={[killItem.lat, killItem.lng]}>
          <Popup>
            A dead player: {killItem.id}
            <br></br> Killed at: <br></br>
            {killItem.timeOfDeath}
          </Popup>
        </Marker>
      );
    });
  }

  function LocationMarker() {
    const [position, setPosition] = useState(null);

    const map = useMap();

    useEffect(() => {
      map.locate().on("locationfound", function (e) {
        setPosition(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
      });
    }, [map]);

    if (position !== null && player) {
      console.log("her-----");
      console.log(position);
      storageSave(STORAGE_KEY_MAPCORDS, {
        lat: position.lat,
        lng: position.lng,
      });
      setMapCords(STORAGE_KEY_MAPCORDS, {
        lat: position.lat,
        lng: position.lng,
      });
    }

    return position === null ? null : (
      <>
        <Marker position={position}>
          <Popup>You are here.</Popup>
        </Marker>
        {console.log(position.lat, position.lng)}
      </>
    );
  }

  /*
  //Get player location when the game starts
  function LocationMarker() {
    const [position, setPosition] = useState(null);
    const map = useMap({
      locationfound(e) {
        map.locate();
        setPosition(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
      },
    });

    */
  /*
    return position === null ? null : (
      <>
        <Marker position={position}>
          <Popup>Player Location</Popup>
         
          {setKillState([position.lat, position.lng])}
          {console.log(killState)}
        </Marker>
      </>
    );
  }
  */

  //Map
  return (
    <>
      <HeaderNavBar title={gameData.gameTitle} />
      <MapContainer
        center={[59.93012584871356, 10.755658290786386]}
        zoom={14}
        scrollWheelZoom={false}
        height={180}
      >
        <LocationMarker />
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        />

        {/* marker for missions */}
        <MultipleMarkers />
        {/*Rectangle to draw game area*/}
        <Rectangle
          bounds={getRectangle}
          pathOptions={{ color: "black" }}
        ></Rectangle>
        {/*test marker for tombstone styling*/}
        <MultipleTombstoneMarkers />
      </MapContainer>
    </>
  );
}

export default Map;
