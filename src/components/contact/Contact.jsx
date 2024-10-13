import React, { useState } from 'react';
import axios from 'axios';

const Contact = () => {
    const [formData, setFormData] = useState({
        names: '',
        email: '',
        subject: '',
        description: ''
    });
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({
        names: '',
        email: '',
        subject: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        validateField(e.target.name, e.target.value);
    };

    const validateField = (name, value) => {
        let error = '';
        if (name === 'names' || name === 'subject') {
            if (/[^a-zA-Z\s]/.test(value)) {
                error = 'No numbers or special characters allowed';
            } else if (!value.trim()) {
                error = 'This field is required';
            }
        } else if (name === 'email') {
            if (!value.endsWith('@gmail.com')) {
                error = 'Email must end with @gmail.com';
            } else if (!value.trim()) {
                error = 'This field is required';
            }
        }
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: error
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const hasErrors = Object.values(errors).some((error) => error);
        const hasEmptyFields = Object.values(formData).some((field) => !field.trim());
        if (hasErrors || hasEmptyFields) {
            setMessage('Please fix the errors and fill in all required fields.');
            return;
        }
        try {
            const response = await axios.post('http://127.0.0.1:8000/contact-us/', formData);
            if (response.status === 200) {
                setMessage('Message sent successfully');
                setFormData({
                    names: '',
                    email: '',
                    subject: '',
                    description: ''
                });
            }
        } catch (error) {
            if (error.response) {
                setMessage(error.response.data.error || 'Failed to send message');
            } else {
                setMessage('Failed to send message');
            }
        }
    };

    return (
        <section id="contact">
            <div className="container">
                <h2
                    data-aos="fade-up"
                    className='text-headingColor font-[700] text-[2.5rem] mb-8 text-center'>Get in touch
                </h2>
                <div className='md:flex justify-center items-center'>
                    <div
                        data-aos="fade-left"
                        className='w-full mt-8 md:mt-0 md:w-1/2 sm:h-[450px] lg:flex items-center bg-indigo-100 px-4 lg:px-8 py-8'>
                        <form className='w-full' onSubmit={handleSubmit}>
                            {message && <div className="mb-5 text-red-500">{message}</div>}
                            <div className="mb-5">
                                <input
                                    type="text"
                                    name="names"
                                    value={formData.names}
                                    onChange={handleChange}
                                    placeholder='Enter your name'
                                    className='w-full p-3 focus:outline-none rounded-[5px]'
                                />
                                {errors.names && <p className="text-red-500 text-sm">{errors.names}</p>}
                            </div>
                            <div className="mb-5">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder='Enter your Email'
                                    className='w-full p-3 focus:outline-none rounded-[5px]'
                                />
                                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                            </div>
                            <div className="mb-5">
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder='Subject'
                                    className='w-full p-3 focus:outline-none rounded-[5px]'
                                />
                                {errors.subject && <p className="text-red-500 text-sm">{errors.subject}</p>}
                            </div>
                            <div className="mb-5">
                                <textarea
                                    type="text"
                                    rows={3}
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder='Write your message'
                                    className='w-full p-3 focus:outline-none rounded-[5px]'
                                />
                            </div>
                            <button
                                type="submit"
                                className='flex items-center justify-center gap-1 w-full p-3 focus:outline-none rounded-[5px] bg-gray-500 text-white hover:bg-headingColor ease-linear duration-150'>
                                <i className="ri-mail-send-line text-2xl"></i>Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Contact;
