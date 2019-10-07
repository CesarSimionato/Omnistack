import React, { useState, useEffect, useMemo } from 'react';
import {Link} from 'react-router-dom';
import api from '../../services/api'

import socketio from 'socket.io-client';

import './styles.css';

export default function Dashboard(){

  const [ spots, setSpots ] = useState([])
  const [ requests, setRequests] = useState([]) 

  useEffect(() => {
    async function loadSpots(){
      const user_id = localStorage.getItem('user');
      const response = await api.get('/dashboard', {
        headers: { user_id }
      });
      setSpots(response.data)
    }
    loadSpots();
  })

  const user_id = localStorage.getItem('user');
  const socket = useMemo( () => socketio.connect('http://localhost:3333', {
    query: { user_id }
  }), [user_id]);

  useEffect(() => {   
    socket.on('booking_request', data => {
      setRequests([...requests, data]);
    })
  }, [requests, socket])

  async function handleAccept(id){
    await api.post(`/bookings/${id}/approvals`);
    setRequests(requests.filter(request => request._id !== id));
  }

  function handleReject(id){
    await api.post(`/bookings/${id}/rejections`);
    setRequests(requests.filter(request => request._id !== id));
  }

  return (
    <>
      
      <ul className="notifications">
        {requests.map(request => (
          <li key={request._id}>
            <p>
              <strong>{request.user.email}</strong> esta solicitando uma reserva em <strong>{request.spot.company}</strong> para a data: <strong>{request.date}</strong>
              <button className="accept" onClick={() => handleAccept(request._id)}>ACEITAR</button>
              <button className="reject" onClick={() => handleReject(request._id)}>REjEITAR</button>
            </p>
          </li>
        ))}
      </ul>

      <ul className="spot-list">
        {
          spots.map( spot => (
            <li key={spot._id}>
              <header style={{ backgroundImage: `url(${spot.thumbnail_url})` }}></header>
              <strong>{spot.company}</strong>
              <span>{spot.price ? `R$${spot.price}/dia` : `Gratuito`}</span>
            </li>
          ))
        }
      </ul>

      <Link to="/new">
        <button className="btn">
          Cadastrar novo spot
        </button>
      </Link>

    </>
  )
}