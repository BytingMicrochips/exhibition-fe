import { useContext } from "react";
import { ModalContext } from "./App";

const handleFullImg = (api, id, imgId, altText) => {
    const [modal, setModal] = useContext(ModalContext);
    const metMuseumUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=`;

  setModal(!modal);
  if (apiSelector === metMuseumUrl) {
    const match = results.filter((item) => {
      return item.objectID === id;
    });
    setMetModal(match[0]);
  } else {
    setModalId(id);
    setModalImgId(imgId);
    setModalAltText(altText);
  }
};

export default handleFullImg;
