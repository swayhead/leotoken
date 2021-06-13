import React from "react";
export default function Card(props) {
    return (
        <div className="m-6 mx-auto bg-white rounded-xl shadow-md ">
            <div className={`${props.styles.cardLabel}`}>{props.inProcess ? 'Processing transaction. Please wait...' : ''}</div>
            <div className="flex items-center space-x-4 p-6 pt-2 ">
                <div className="flex-shrink-0">
                    <img className={`${props.styles.rotorImg} ${props.inProcess ? 'animate-spin-3s' : ''}`} src="/logo192.png" alt="Logo" />
                </div>
                <div className="w-full">
                    {props.children}
                </div>
            </div>
        </div>
    )
}