import React from 'react';
import io from "socket.io-client";

export default React.createContext(io());