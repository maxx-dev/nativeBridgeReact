import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'


/**
 Install deps with:

 cd devServer
 npm install

 cd ..

 cd server
 npm install


 Follow the instructions provided in server/server.js to get push notifications working
 */

/**
   Launch with:

   cd devServer
   npm start

 */

import NativeDeviceCommunicator from './NativeDeviceCommunicator'

render( <div className="viewCont">


    <NativeDeviceCommunicator/>
    </div>,
    document.body
)