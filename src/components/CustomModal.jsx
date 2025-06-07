import React from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
export const CustomModal = ({ isOpen, toggle, children, modalTitle }) => {

    return (
        <>
            <Modal fullscreen isOpen={isOpen} toggle={toggle}  >
                <ModalHeader toggle={toggle}>{modalTitle}</ModalHeader>
                <ModalBody>
                    {children}
                </ModalBody>
            </Modal>
        </>
    )
}
