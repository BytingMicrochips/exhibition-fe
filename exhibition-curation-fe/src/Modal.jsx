import { Fragment } from "react";
import { useContext } from "react";
import { ModalContext } from "./App";

const Modal = (props) => {
    const [modal, setModal] = useContext(ModalContext);

    const handleModal = () => {
    setModal(!modal);
    }
    
  return (
    <>
      <div className="modal" onClick={handleModal}>
        <div className="overlay">
          <div className="modalContent">
            <img className="modalImg" alt={props.altText} src={props.srcLink} />
            <p>
              <em>Touch anywhere to close</em>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;