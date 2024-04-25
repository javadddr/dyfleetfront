

import React, { useState } from 'react';
import './Contact.css';
import senti  from "./sent.png"
const Contact = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
  
    if (!firstName || !lastName || !email || !message) {
     
      return;
    }
  
    setIsLoading(true);
  
    setTimeout(() => {
    const customerMessage = {
      firstName,
      lastName,
      email,
      phoneNumber,
      company,
      message,
    };
      
      console.log(customerMessage);
  
      
      fetch('https://api.globalpackagetracker.com/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerMessage),
    })
    .then((response) => {
      if (response.ok) {
            setIsPopupVisible(true);
      } else {
            console.error('Failed to send the message');
      }
    })
    .catch((error) => {
      console.error('Error occurred while sending the message:', error);
    })
    .finally(() => {
      setIsLoading(false);
        });

    
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhoneNumber('');
      setCompany('');
      setMessage('');
    }, 2000);
  };



 

  return (
   
    <div className="contact-page">
      <div>
        <div className='kamel'>
          <div className='kamel2'>
            <div className="contact-container">
              <div className="contact-form">
                <h2 className='sentus'>Send Us A Message</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label className='namei'>TELL US YOUR NAME</label>
                    <div className='input1'>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        className='input11'
                      />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        className='input12'
                      />
                    </div>
                  </div>
                  <div className="form-group2">
                    <label className='namei'>ENTER YOUR EMAIL *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className='input21'
                      placeholder="Eg. example@email.com"
                      required
                    />
                  </div>
                  <div className="form-group3">
                    <label className='namei'>ENTER PHONE NUMBER</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className='input31'
                      placeholder="Eg. +1 800 000000"
                    />
                  </div>
                  <div className="form-group3">
                    <label className='namei'>ENTER COMPANY</label>
                    <input
                      type="tel"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className='input31'
                      placeholder="Your Company"
                    />
                  </div>
                  <div className="form-group4">
                    <label className='namei'>MESSAGE *</label>
                    <textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      placeholder="Type your message here..."
                      className='input41'
                    ></textarea>
                  </div>
                  <button className='sent' type="submit" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
              <div className="contact-info">
                <div className='thead'>
                  <div className='Address'>
                    <h2 className='justflex'>
                      <span className="icon1"></span> Address
                    </h2>
                    <p>Holzheimer Weg 11, 41464 Neuss, Germany</p>
                  </div>
                  <div className='Talk'>
                    <h2 className='justflex'>
                      <span className="icon2"></span> Lets Talk
                    </h2>
                    <p>+49 151 56338464</p>
                  </div>
                  <div className='contact'>
                    <h2 className='justflex'>
                      <span className="icon3"></span> General Support
                    </h2>
                    <p>Hello@dynamofleet.com</p>
                  </div>
                  <div className='Opening'>
                    <h2 className='justflex'>
                      <span className="icon4"></span> Opening Hours
                    </h2>
                    <p>Monday-Friday <br></br>8 AM-16 PM (UTC)</p>
                  </div>
                </div>
              </div>
            
              {isPopupVisible && (
                <div className="popup">
                  <div className="popup-content">
                    <button className="close-button" onClick={() => setIsPopupVisible(false)}>
                      Close
                    </button>
                    <div className='messagesent'>
                    <img className='senti' src={senti} alt="senti" />
                    <p id='textsent'>Your message has been sent to us. We will get back to you shortly!</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
   
  );
};

export default Contact;

