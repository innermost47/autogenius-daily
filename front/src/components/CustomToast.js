import React from "react";
import Toast from "react-bootstrap/Toast";

function CustomToast({ message, className = "", onClose }) {
  return (
    <Toast onClose={onClose} delay={3000} autohide className={className}>
      <Toast.Header>
        <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
        <strong className="me-auto">AutoGenius Daily</strong>
        <small>Just now</small>
      </Toast.Header>
      <Toast.Body>{message}</Toast.Body>
    </Toast>
  );
}

export default CustomToast;
