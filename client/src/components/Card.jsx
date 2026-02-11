import React from "react";
import logo from "/logo192.png";
export default function Card(props) {
    return (
        <div className="m-6 w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
            <div className={`${props.styles.cardLabel}`}>{props.inProcess ? 'Processing transaction. Please wait...' : ''}</div>
            <div className="flex items-center space-x-4 p-6 pt-2 ">
                <div className="flex-shrink-0">
                    <img className={`${props.styles.rotorImg} ${props.inProcess ? 'animate-spin-3s' : ''}`} src={logo} alt="Logo" />
                </div>
                <div className="min-w-0 flex-1">
                    {props.children}
                </div>
            </div>
        </div>
    )
}