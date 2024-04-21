import { Fragment } from "react";
import { useContext } from "react";
import { ModalContext, ModalPropsContext } from "./App";

const Modal = (props) => {
    const [modal, setModal] = useContext(ModalContext);
    const [modalProps, setModalProps] = useContext(ModalPropsContext);
    
  const handleExitModal = (e) => {
    setModal(!modal);
    }
    
  return (
    <Fragment key={"ModalPage"}>
      <div className="modal" onClick={handleExitModal}>
        <div className="overlay">
          <div className="modalContent">
            {modalProps.config ? (
              <img
                className="modalImg"
                alt={modalProps.altText}
                src={
                  `${modalProps.config}/${modalProps.id}/full/400,/0/default.jpg`}
              />
            ) : (
              <img
                className="modalImg"
                alt={modalProps.medium}
                src={modalProps.src}
              />
            )}
            <p>
              <em>Touch anywhere to close</em>
            </p>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Modal;