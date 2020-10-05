import React, { useRef, useContext, useState } from 'react';
import {useHistory} from 'react-router-dom';
import {Input, Button, Form, Select, message} from 'antd';
import {UserOutlined, LockOutlined, CopyOutlined} from '@ant-design/icons';
import loginImage from './images/login.svg';
import {doctors, radiationTypes, userContext} from './App';

export default () => {
    const history = useHistory();
    history.push('/login');
    return (
    <div className="content">
        
    </div>);
}


export const LoginPage = () => {

    return (
        <div className="start-container">
            <Form className='login-form'>
                <h2 style={{textAlign: 'center'}}>ادخل بياناتك</h2>
                <Form.Item
                name='username'
                rules={[{
                    required: true,
                    message: 'برجاء ادخال اسم المستخدم'
                }]}
                >
                <Input dir='ltr' suffix={<UserOutlined style={{color: 'grey', marginRight: '10px'}}/>} placeholder="اسم المستخدم" />
                </Form.Item>
                
                <Form.Item
                name='password'
                rules={[{
                    required: true,
                    message:'برجاء ادخال كلمة السر'
                }]}
                >
                <Input type='password' dir='ltr' suffix={<LockOutlined style={{color: 'grey', marginRight: '10px'}}  />} placeholder="كلمة المرور" />
                </Form.Item>
                <Button className='login-btn' htmlType='submit' type='primary'>تسجيل الدخول</Button>
            </Form>
            <div className='side-image'>
                <img src={loginImage} alt='#'/>
            </div>
        </div>
    );
}


export const ReservationPage = ({onSubmit}) => {
    const user = useContext(userContext);
    const [radiationsTimeMessages, setMessages] = useState([]);
    return (
    <div className='start-container'>
        
        <div className='reservation-form'>
            <h2 style={{textAlign: 'center'}}><b>يمكن الحجز الكترونيا الان !</b></h2>
            <Form onSubmit={onSubmit}>
                {!user.isPatient ?
                <>
                <Form.Item
                name='name'
                rules={[{
                    required: true,
                    message: 'برجاء ادخال الاسم '
                }]}
                label='الاسم ثلاثي'
                >
                    <Input />
                </Form.Item>

                <Form.Item
                name='phoneNumber'
                rules={[{
                    required: true,
                    message: 'برجاء ادخال رقم الهاتف'
                }]}
                label='رقم الهاتف'
                >
                    <Input type='number' />
                </Form.Item>
                
                <>{ !user.isDoctor ? <Form.Item
                name='doctor'
                label='الطبيب المسؤل'
                required
                >
                    <Select defaultValue='--اختر الطبيب--'>
                        {[...doctors, 'اخر'].map((doctor, i) => {
                        return <Select.Option key={i}>{doctor}</Select.Option>
                        })}
                    </Select>
                </Form.Item> : <></>}</></> : <></>}

                <Form.Item
                name='radiations'
                label='نوع الاشعة'
                rules={[{
                    required: true,
                    message: 'برجاء اختيار انواع الاشعاعات التي تود القيام بها'
                }]}
                >
                    <Select mode='multiple' onChange={(selected) => {
                        setMessages(selected.map(i => radiationTypes[i].message ))
                    }} placeholder='اسم الاشعة'>
                        {radiationTypes.map((radiation, i) => {
                        return <Select.Option key={i}>{radiation.name}</Select.Option>
                        })}
                    </Select>
                </Form.Item>
                
                {!user.isPatient ?
                <Form.Item
                name='address'
                rules={[{
                    required: true,
                    message: 'برجاء ادخال العنوان'
                }]}
                label='العنوان'
                >
                    <Input.TextArea />
                </Form.Item>
            : <></>}
                
                <ul>
                {radiationsTimeMessages.map((msg, i) => <li key={i}>{msg}</li>)}
                </ul>
                <Button htmlType='submit' type='primary' style={{width: '100%'}}>احجز الان</Button>
            </Form>
        </div>
        <div className='bg-style'>
        { !user.isAdmin ?<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#000" fill-opacity="0.1" d="M0,96L60,90.7C120,85,240,75,360,64C480,53,600,43,720,74.7C840,107,960,181,1080,181.3C1200,181,1320,107,1380,69.3L1440,32L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        </svg> : <></>}
        </div>
    </div>);
}


export const ContactPage = () => {
    const input = useRef();
    return (
        <div style={{width: '100%', 'height': '70%', display: 'flex', justifyContent: 'center', padding: '30px',alignItems: 'center', flexDirection: 'column'}}>
            <h1><b>يمكنكم التواصل معنا لاي اسفسارات علي هذا الرقم</b></h1>
            <div dir='ltr' style={{display: 'flex'}}>
                <Input ref={input} value='+0201101306910' disabled/>
                <Button onClick={() => {
                    input.current.select();
                    document.execCommand('copy');
                    message.success('تم نسخ رقم الهاتف بنجاح');
                }} type='ghost' icon={<CopyOutlined />}>copy</Button>
            </div>
            
        </div>
    );
}