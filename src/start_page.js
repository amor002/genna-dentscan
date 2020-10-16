import React, { useRef, useContext, useState, useEffect } from 'react';
import {useHistory} from 'react-router-dom';
import {Input, Button, Form, Select, message} from 'antd';
import {UserOutlined, LockOutlined, CopyOutlined} from '@ant-design/icons';
import loginImage from './images/login.svg';
import { Loader } from './kit.js';
import {doctors, userContext} from './App';
import * as firebase from 'firebase/app';

export default () => {
    const history = useHistory();
    history.push('/login');
    return (
    <div className="content">
        
    </div>);
}


export const LoginPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    return (
        <div className="start-container">
            <Form form={form} className='login-form'>
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
                <Button onClick={async () => {
                    const data = await form.validateFields();
                    setLoading(true);
                    firebase.auth().signInWithEmailAndPassword(`${data.username}@ganna.com`, data.password).then(() => {
                        setTimeout(() => history.push('/'), 200);
                    })
                    .catch((e) => {
                        setTimeout(() => {try{ setLoading(false)}catch{}}, 200);
                        message.error('كلمة المرور او اسم المستخدم غير صحيحين');
                    });

                }} className='login-btn' dir='ltr' loading={loading}  htmlType='submit' type='primary'>تسجيل الدخول</Button>
                
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
    const [doctors, setDoctors] = useState(undefined);
    const [form] = Form.useForm();
    
    const [radiations, setRadiations] = useState(undefined);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        firebase.firestore().collection('radiations').get().then(sn => {
        setRadiations(sn.docs.map(doc => {return {...doc.data(), id: doc.id}}));
        }).catch(() => {
        setRadiations([]);
        });

        if(user.isAdmin || user.isAnonymous) {
            firebase.firestore().collection('doctors').doc('all').get().then((doc) => {
                if(doc.exists) {
                    setDoctors(doc.data().doctors);
                    
                }else {
                    setDoctors([]);
                }
            });
        }else {
            setDoctors([]);
        }
    }, []);

    if(radiations === undefined || doctors === undefined) return <Loader />;
    return (
    <div className='start-container'>
        
        <div className='reservation-form'>
            <h2 style={{textAlign: 'center'}}><b>يمكن الحجز الكترونيا الان !</b></h2>
            <Form form={form}>
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
                rules={[
                    {
                        required: true
                    }
                ]}
                >
                    <Select defaultValue='--اختر الطبيب--'>
                        {[...doctors, 'اخر'].map((doctor, i) => {
                            
                        return <Select.Option key={i} value={i !== doctors.length ? JSON.stringify(doctor) : 'other'}>{i !== doctors.length ? Object.values(doctor)[0] : doctor}</Select.Option>
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
                        setMessages(selected.map(i => radiations[i].message ))
                    }} placeholder='اسم الاشعة'>
                        {radiations.map((radiation, i) => {
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
                <Button onClick={async () => {
                    const data = await form.validateFields();
                    data.radiations = data.radiations.map(r => radiations[r]);
                    data.doctor = user.isAdmin || user.isAnonymous ? (data.doctor === 'other' ? data.doctor : JSON.parse(data.doctor)) : null;      
                    setLoading(true);
                    await onSubmit(data);
                    setLoading(false);
                    form.setFieldsValue({
                        name: '',
                        phoneNumber: '',
                        address: '',
                        radiations: [],
                        doctor: ''
                    });
                    
                    }} htmlType='submit' dir='ltr' loading={loading} type='primary' style={{width: '100%'}}>احجز الان</Button>
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
                <Input ref={input} value='+0201101306910' />
                <Button onClick={() => {

                    input.current.select();
                    document.execCommand('copy');
                    message.success('تم نسخ رقم الهاتف بنجاح');
                }} type='ghost' icon={<CopyOutlined />}>copy</Button>
            </div>
            
        </div>
    );
}