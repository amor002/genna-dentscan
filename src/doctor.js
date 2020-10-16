import React, { useContext, useState, useEffect } from 'react';
import {useLocation, useHistory, NavLink} from 'react-router-dom';
import {Card, Col, Row, Divider, Spin, Form,Button, Table, Input, message,Select, Tag, Modal, Switch as ToggleButton, InputNumber} from 'antd';
import logo from './images/logo.jpg';
import {userContext} from './App';
import {Link} from 'react-router-dom';
import {EditableTable, reshaped, Loader, timeStampToDate, usePagination} from './kit';
import * as firebase from 'firebase/app';
import {EditOutlined, AlignLeftOutlined} from '@ant-design/icons';
import { ReservationPage } from './start_page';



export const DoctorsList = () => {
    const user = useContext(userContext);
    const[doctorsList, setDoctors] = useState(undefined);

    useEffect(() => {
      firebase.firestore().collection('doctors').where('clinicID', '==', user.clinicID).get().then((sn) => {
        setDoctors(sn.docs.map(doc => {
          return {...doc.data(), id: doc.id}
        }));
      });
    }, []);

    if(doctorsList === undefined) {
      return <Loader />;
    }

    const columns = [
        {
            title: 'الكود',
            dataIndex: 'code',
            render: code => <div style={{textAlign: 'left'}}>{code}</div>
          },
          {
            title: 'الرصيد',
            dataIndex: 'balance',
            render: balance => <div style={{textAlign: 'left'}}>{balance} EGP</div>
          },
          {
            title: 'الخصم',
            dataIndex: 'discount',
            render: discount => <div style={{textAlign: 'left'}}>{discount.type === 'value' ? `${discount.value} EGP` : `${discount.value}%`}</div>
          },
          {
            title: 'الربح',
            dataIndex: 'earns',
            render: earns => <div style={{textAlign: 'left'}}>{earns.type === 'value' ? `${earns.value} EGP` : `${earns.value}%`}</div>
          }
          ,
          {
            title: 'اشعة الخصم',
            dataIndex: 'discountRadiations',
            render: radiations => <div style={{textAlign: 'left'}}>{radiations.map((r, i) =>  <Tag color='blue' key={i}>{r}</Tag>)}</div>
          },
          
          {
            title: 'الاسم',
            dataIndex: 'name',
            render: text => <div style={{textAlign: 'left'}}>{user.isAdmin ? <a>{text}</a> : text}</div>,
          }
    ];
    

    return <div>

        <h2 style={{textAlign: 'center', margin: 20}}>بيانات الاطباء</h2>
        <Table  columns={columns} scroll={{x: 300}} dataSource={doctorsList.map(doctor => {
        return {
            key: doctor.id,
            code: doctor.id,
            balance: doctor.balance,
            name: doctor.name,
            discount: doctor.discount,
            earns: doctor.earns,
            discountRadiations: doctor.discount.radiations
        };
    })}/></div>
}

export default () => {
    const user = useContext(userContext);
    const [data, setStudies] = usePagination({
      path: 'studies',
      load_count: 13,
      where: `doctorID == ${user.uid}`
    });
    if(data.noObjects) {
      return <h1 style={{margin: 20}}>لا يوجد مرضي مسجلين حتي الان</h1>;
    }

    if(data.data.length === 0) {
      return <Loader />;
    }

    /*
    if(user.isAccountant) {
        return ;
    }*/

    return (
        <div className='container'>
            {reshaped(data.data, window.screen.availWidth < 680 ? (window.screen.availWidth < 460 ? 1 : 2) : 3).map((studies, i) => {

                return (
                    <Row key={i} gutter={[16,16]}>
                        {
                            studies.map((study, j) => {
                                if(studies.length === 1) {
                                    return (
                                        <Card key={j} style={{width: '100%', marginTop: 10}} title={study.name} extra={<Link to={`/preview-study/${study.id}`}>المزيد</Link>}>
                                            <p>الكود : {study.id}</p>
                                            <p>رقم الهاتف : {study.phoneNumber}</p>
                                        </Card>
                                    );
                                }
                                return (
                                    <Col key={j} span={window.screen.availWidth < 680 ? 12 : 8}>
                                        <Card title={study.name} extra={<Link to={`/preview-study/${study.id}`}>المزيد</Link>}>
                                            <p>الكود : {study.id}</p>
                                            <p>رقم الهاتف : {study.phoneNumber}</p>
                                        </Card>
                                    </Col>
                                );
                            })
                        }
                    </Row>
                );
                
            })}
        </div>
    );
}


const StudyRadiationProvider = ({radiation}) => {

  const [imageUrl, setImageUrl] = useState(undefined);

  useEffect(() => {

    firebase.storage().ref(radiation.image).getDownloadURL().then(url => {
      setImageUrl(url);
    }).catch(e => {
      console.log(e.message);
    });
  }, []);
  if(imageUrl === undefined) {
    return <Spin size='default' />;
  }

  return (
    <div className='radiation-content'>
        <img src={imageUrl} alt='#'/>
      <b style={{textAlign: 'center'}}>{radiation.radiationType}</b>
      <i>{timeStampToDate(radiation.date).toDateString()}</i>
      <a href={imageUrl} target="_blank" download>تحميل</a>
      <Divider />
    </div>
  );
}

export const PreviewStudyPage = ({match, patient}) => {
    const [study, setStudy] = useState(patient);
    const studyID = patient ? patient.uid : match.params.id;

    useEffect(() => {
      if(!study) {
        firebase.firestore().collection('studies').doc(studyID).get().then(d => {
          setStudy(d.data());
        });
      }
    }, []);

    if(study === undefined) {
      return <Loader />;
    }

    return (
      <div className='container' style={{backgroundColor: '#fff', margin: '20px', border: '0.1px solid #e2e2e2'}}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
              <h2>الاسم : {study.name}</h2>
          </Col>
          <Col span={12}>
            <h2 style={{textAlign: 'left'}}>الطبيب المسؤل : {study.doctorName ? study.doctorName : 'طبيب غير متعاقد معه'}</h2>  
          </Col>
        </Row>
  
        <Row gutter={[16, 16]}>
          <Col flex='auto'>
          <h3>رقم الهاتف : {study.phoneNumber}</h3>
          </Col>
          <Col flex='auto'>
            <h3 style={{textAlign: 'left'}}>كلمة السر : {study.password}</h3>
          </Col>
            
        </Row>
        <Row gutter={[16, 16]}>
            <h3>العنوان : {study.address}</h3>
        </Row>
        <Row gutter={[16, 16]}>
            <h3>الكود : {studyID}</h3>
        </Row>
        <Divider />
        <h3><b>صور الاشعة الخاصة بالمريض </b></h3>
        {study.radiations.length === 0? <h2>لا توجد صور مرفقة</h2> : <></>}
        {study.radiations.map((radiation, i) => {
          
          return <StudyRadiationProvider radiation={radiation} key={i} />;
        })}
        
      </div>
    );
  }
  

export const DoctorProfilePage = ({match}) => {
  
    const user = useContext(userContext);
    const [discountUpdating, setDiscountUpdating] = useState(false);
    const [earnsUpdating, setEarnsUpdating] = useState(false);

    const doctorInfo = user.isDoctor ? {id: user.uid, clinicID: user.doctorClinic} : {id: match.params.id, clinicID: match.params.clinicID};
    
    const [doctorData, setDoctorData] = useState(undefined);
    useEffect(() => {
      firebase.firestore().collection('clinics').doc(doctorInfo.clinicID).collection('doctors').doc(doctorInfo.id).get().then(async (doc) => {

        let data = {...doc.data(), id: doc.id};
        data.contractionDate = new Date(data.contractionDate.seconds * 1000);
        let criticalData = {};
        if(data.showDiscount || user.isAdmin) {
          criticalData = (await firebase.firestore().collection('doctors').doc(doctorInfo.id).get()).data();
        }

        if(data.image) {
          firebase.storage().ref(data.image).getDownloadURL().then(url => {
            data.doctorImageUrl = url;
            setDoctorData({...data, ...criticalData});
          });
        }
        setDoctorData({...data, ...criticalData});
      });
    }, []);

    if(doctorData === undefined) {
      return <Loader />;
    }
    
    const fs = firebase.firestore();

    const dataUpdate = (field, {value} ) => {
      let update = {};
      update[field] = value;

        fs.collection('clinics').doc(doctorInfo.clinicID)
        .collection('doctors').doc(doctorInfo.id).update(update);
    }

    const imageUpdate = async (field, _ , file) => {
      let res = await firebase.storage().ref().child(`doctors/${doctorInfo.id}/${field}`).put(file);
      let update = {};
      update[field] = res.ref.location.path;
      await fs.collection('clinics').doc(doctorInfo.clinicID).collection('doctors').doc(doctorInfo.id).update(update);
      doctorData[field] = res.ref.location.path;
      message.success('تم رفع الصورة بنجاح');
    }
    
    
    return (
    <div className='container'>
        <div>
            <div style={{backgroundColor: '#fff', backgroundImage: `url("${doctorData.doctorImageUrl ?
             doctorData.doctorImageUrl : 'https://www.pngitem.com/pimgs/m/198-1985222_avatar-doctor-png-transparent-png.png'}")`,
            backgroundPosition: 'center',
             backgroundSize: 'cover',
             marginLeft: 8,
             marginBottom: 8,
             float: 'right',
              width: 130, height: 130}}/>
            <div>
            <h2><b>{doctorData.name} </b> ({doctorData.id})</h2>
                <h3>{doctorData.specialization}</h3>
                
                {doctorData.showDiscount || user.isAdmin ?
                <h3> في الحساب {doctorData.balance} EGP</h3>: <></>
                }
                
            </div>
        </div>
        <br/>
        <div dir='ltr' className='doctor-data-table'>
        <EditableTable doctor={doctorData} originData={[
            {
                key: 0,
                element: 'الاسم',
                fieldName: 'name',
                value: doctorData.name,
                disabled: true
                
                
            },
            {
                key: 1,
                element: 'رقم الهاتف',
                fieldName: 'phoneNumber',
                value: doctorData.phoneNumber,
                onUpdate: dataUpdate
            },
            {
                key: 2,
                element: 'الصورة',
                fieldName: 'image',
                value: doctorData.image,
                isImage: true,
                onUpdate: imageUpdate
            },
            {
                key: 3,
                element: 'تاريخ التعاقد',
                fieldName: 'contractionDate',
                value: doctorData.contractionDate.toDateString(),
                disabled: true 
            },
            {
                key: 4,
                element: 'كود',
                fieldName: 'id',
                value: doctorData.id,
                onUpdate: dataUpdate,
                disabled: true 
            },
            {
                key: 5,
                element: 'اسم السكرتير',
                fieldName: 'secretaryName',
                value: doctorData.secretaryName,
                onUpdate: dataUpdate,
            },
            {
                key: 6,
                element: 'الموظف المسؤل عن التعامل',
                fieldName: 'responsibleEmployee',
                value: doctorData.responsibleEmployee,
                onUpdate: dataUpdate,
                disabled: user.isDoctor
            },
            {
                key: 7,
                element: 'رقم تيليفون السكرتير',
                fieldName: 'secretaryPhoneNumber',
                value: doctorData.secretaryPhoneNumber,
                onUpdate: dataUpdate,
            },
            {
                key: 8,
                element: 'البريد الالكتروني',
                fieldName: 'email',
                value: doctorData.email,
                onUpdate: dataUpdate,
            },
            {
                key: 9,
                element: 'رقم الواتس',
                fieldName: 'whatsAppNumber',
                value: doctorData.whatsAppNumber,
                onUpdate: dataUpdate,
            },
            {
                key: 10,
                element: 'صورة الكارت',
                fieldName: 'cardImage',
                value: doctorData.cardImage,
                onUpdate: imageUpdate,
                isImage: true
            },
            {
              key: 11,
              element: 'كلمة المرور',
              fieldName: 'password',
              value: doctorData.password,
              disabled: true
          }
        ]}/>
        </div>
        {user.isAdmin ? 
        
        <><span><strong style={{marginLeft: 10}}>اظهار الحسابات و الخصومات الي الطبيب في صفحته</strong></span><ToggleButton onClick={() => {
          doctorData.showDiscount = !doctorData.showDiscount;
          firebase.firestore().collection('clinics').doc(doctorInfo.clinicID).collection('doctors').doc(doctorInfo.id).update({
            showDiscount: doctorData.showDiscount
          });
        }} defaultChecked={doctorData.showDiscount}/></>: <></>}
        {
          ((user.isDoctor && doctorData.showDiscount) || user.isAdmin) ?
        <div style={{margin: 10, padding: 13,
             backgroundColor: '#f8ffff',
             position: 'relative',
              border: '1px solid #a9d5de'}}>
            
            <h2 style={{color: '#0e566c', fontWeight: 'bold'}}>الخصم : {doctorData.discount.value} {doctorData.discount.type === 'value' ? 'EGP' : '%'}</h2>
            <ul>
                {doctorData.discount.radiations.map((i, j) => {
                return <li key={j}>{i}</li>;
                })}
            </ul>

            {user.isAdmin ?

<Button onClick={() => setDiscountUpdating(true)} style={{position: 'absolute', left: 10, top: 10}} type="text" icon={<EditOutlined />}/>:
<></>
            }
            
            
        </div>
        
      : <></>
      }

{
          ((user.isDoctor && doctorData.showDiscount) || user.isAdmin) ?
        <div style={{margin: 10, padding: 13,
             backgroundColor: '#f8ffff',
             position: 'relative',
              border: '1px solid #a9d5de'}}>
            
            <h2 style={{color: '#0e566c', fontWeight: 'bold'}}>الربح : {doctorData.earns.value} {doctorData.earns.type === 'value' ? 'EGP' : '%'}</h2>
            {user.isAdmin ?

<Button onClick={() => setEarnsUpdating(true)} style={{position: 'absolute', left: 10, top: 10}} type="text" icon={<EditOutlined />}/>:
<></>
            }
            
        
      {user.isAdmin && discountUpdating ? <DiscountUpdateModal visible={true} onOk={(data) => {
        let reformedData = {
          discount: {
            type: data.discountType,
            value: data.discountValue,
            radiations: data.discountRadiations
          }
        };

        firebase.firestore().collection('doctors').doc(doctorInfo.id)
        .update(reformedData);

        doctorData.discount = reformedData.discount;
        setDoctorData({...doctorData});
        setDiscountUpdating(false);
      }} onCancel={() => setDiscountUpdating(false)} doctor={doctorData}/> : <></>}
        
        </div>
        
      : <></>
      }


      {user.isAdmin && earnsUpdating ? 
      <EarnsUpdateModal doctor={doctorData} visible={true} onOk={(data) => {
        console.log(data);
        const reformedData = {
          earns: {
            type: data.earnType,
            value: data.earnValue
          }
        };

        firebase.firestore().collection('doctors').doc(doctorInfo.id).update(reformedData);
      
        doctorData.earns = reformedData.earns;
        setDoctorData({...doctorData});
        setEarnsUpdating(false);
      }} onCancel={() => setEarnsUpdating(false)}/>
    :<></>}

    {user.isAdmin && user.adminDegree > 1 ? 
    <Button onClick={() => {
      if(window.confirm('تأكيد عملية السحب')) {
        fs.collection('doctors').doc(doctorInfo.id).update({
          balance: 0
        }).then(() => {
          message.success('تمت عملية السحب بنجاح');
          setDoctorData({...doctorData, balance: 0})
        })
      }
    }} className='btn-expanded' type='primary'>سحب الرصيد </Button> : <></>
    }
   </div>);
}

const DiscountUpdateModal = ({visible, onOk, onCancel, doctor}) => {
  const [form] = Form.useForm();
  const [radiations, setRadiations] = useState(undefined);

  useEffect(() => {
    firebase.firestore().collection('radiations').get().then(sn => {
      setRadiations(sn.docs.map(doc => {return {...doc.data(), id: doc.id}}));
    }).catch(() => {
      setRadiations([]);
    });
  }, []);
  if(radiations === undefined) return <Spin size='medium'/>;
  return (
    <Modal visible={visible} onCancel={onCancel} onOk={async () => {
      
      onOk(await form.validateFields());
      
    }}>
      <div style={{margin: 10}}>
            <Form form={form}>
              <Form.Item
              name='discountValue'
              label='مقدار الخصم'
              initialValue={doctor.discount.value}
              >

                <InputNumber  />
                
              </Form.Item>

              <Form.Item
              name='discountType'
              initialValue={doctor.discount.type}
              label='نوع الخصم'
              >

                <Select>
                  <Select.Option value='percentage'>بالنسبة</Select.Option>
                  <Select.Option value='value'>بالقيمة</Select.Option>
                </Select>
                
              </Form.Item>

              <Form.Item
              name='discountRadiations'
              label=' الخصم يشمل'
              initialValue={doctor.discount.radiations}
              >

                <Select mode='multiple'>
                  {radiations.map((i, j) => {
                    return<><Select.Option key={j} value={i.name}>{i.name}</Select.Option></>
                  })}
                </Select>
                
              </Form.Item>
              
            </Form>
          
          </div>
      </Modal>
  );
}

const EarnsUpdateModal =  ({visible, onOk, onCancel, doctor}) => {
  const [form] = Form.useForm();

  return (
    <Modal visible={visible} onCancel={onCancel} onOk={async () => {
      
      onOk(await form.validateFields());
      
    }}>
      <div style={{margin: 10}}>
            <Form form={form}>
              <Form.Item
              name='earnValue'
              label='مقدار الربح للعميل الواحد'
              initialValue={doctor.earns.value}
              >

                <InputNumber  />
                
              </Form.Item>

              <Form.Item
              name='earnType'
              initialValue={doctor.earns.type}
              label='نوع الربح'
              >

                <Select>
                  <Select.Option value='percentage'>بالنسبة</Select.Option>
                  <Select.Option value='value'>بالقيمة</Select.Option>
                </Select>
                
              </Form.Item>

            </Form>
          
          </div>
      </Modal>
  );
}

export const SearchPage = ({match}) => {
    const [studies, setStudies] = useState(undefined);
    const doctor = useContext(userContext);
    useEffect(() => {
      if(match.params.type === 'code') {
        firebase.firestore().collection('studies').doc(match.params.value).get().then(d => {
          if(!d.exists) {
            return setStudies([]);
          }
          setStudies([{...d.data(), id: d.id}]);
        }).catch(() => {
          setStudies([]);
        });
      }else {
        firebase.firestore().collection('studies').where('doctorID', '==', doctor.uid)
        .where(match.params.type, '==', match.params.value).get().then((d) => {
          setStudies(d.docs.map(doc => {
            return {id: doc.id, ...doc.data()};
          }));
        });
      }
    }, [match.params.value]);

    if(studies === undefined) {
      return <Loader />;
    }
    return <div style={{padding: 15}}>
      {studies.length === 0 ? <h1 dir='ltr'>{match.params.type} '{match.params.value}' doesn't exist</h1> : <></>}
      {reshaped(studies, 3).map((arr,i) => {
        return <Row key={i} gutter={[16,16]}>
          {
            arr.map(study => {
              return <Col key={study.id} flex='auto'>
              <Link to={`/preview-study/${study.id}`} style={{color: 'black'}}><div className='card'>
                  <p>الاسم : {study.name}</p>
                  <p>الكود : {study.id}</p>
              </div></Link>
              </Col>;
            })
          }
        </Row>
      })}
    </div>;
}

export const AddStudyPage = () => {
  const doctor = useContext(userContext);
  const [doctorName, setDoctorName] = useState(undefined);

  useEffect(() => {
    firebase.firestore().collection('clinics').doc(doctor.doctorClinic).get().then(doc => {
      let pause = false;
      doc.data().doctors.forEach(d => {
        if(!pause) {
          
          if(d[doctor.uid] !== undefined) {
            setDoctorName(d[doctor.uid]);
            pause = true;
          }
        }
      });
    })
  }, []);

  if(doctorName === undefined) {
    return <Loader />;
  }

  return (
    <>
    <ReservationPage onSubmit={async (data) => {
      let res = await firebase.functions().httpsCallable('makeReservation')({
        name: data.name,
        phoneNumber: data.phoneNumber,
        doctor: {
          name: doctorName,
          id: doctor.uid
        },
        radiations: data.radiations.map(r => r.id),
        address: data.address
      });

      if(res.data.ok) {
        window.alert('تم طلب الحجز للمريض بنجاح');
      }
    }}/>
    <svg style={{position:'fixed', bottom: 0, width: '100%', zIndex: -3}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#000" fill-opacity=".1" d="M0,64L48,74.7C96,85,192,107,288,96C384,85,480,43,576,58.7C672,75,768,149,864,192C960,235,1056,245,1152,234.7C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
    </>
  );
}

export const NavBar = () => {
    const user = useContext(userContext);
    const [toggled, setToggled] = useState(false);
    const [type, setType] = useState('name');
    const location = useLocation();
    const history = useHistory();
     
    return (
      <nav className='nav-bar'>
        <div className="brand">
          <img src={logo} width='100px' height='86px' alt='#'/>
        </div>
        <div className={`items ${toggled ? 'toggled': ''}`}>
          {!user.isDoctor && !user.isAdmin && !user.isAccountant && !user.isPatient?
          <>
          <NavLink to="/login" onClick={() => setToggled(false)}>تسجيل الدخول</NavLink>
          <NavLink to="/reserve" onClick={() => setToggled(false)}>احجز ميعاد</NavLink>
          <NavLink to='/contact' onClick={() => setToggled(false)}>تواصل معنا</NavLink></>: <></>
        }
        {
          user.isDoctor ? 
          <>
            <Link to='/' onClick={() => {
              firebase.auth().signOut();
            }}>تسجيل الخروج</Link>
            <NavLink to='/add-study' onClick={() => setToggled(false)}>الحجز لمريض</NavLink>
            <NavLink to='/profile' onClick={() => setToggled(false)}>حسابي</NavLink>
            <Link onClick={() => setToggled(false)} className={location.pathname === '/' ? 'active' : null} to='/'>المرضي</Link>
            <div dir='ltr'><Input.Search addonAfter={
            
            <Select defaultValue={type} onChange={(value) => setType(value)}>
              <Select.Option value='name'>الاسم</Select.Option>
              <Select.Option value='code'>الكود</Select.Option>
              <Select.Option value='phoneNumber'>رقم الهاتف</Select.Option>
            </Select>} onSearch={(value) => {
              history.push(`/search/${type}/${value}`);
            } } placeholder='ابحث عن مريض'/></div>
          </>
          : <></>
        }

        {
            user.isAccountant ? 
            <>
            <Link to='/' onClick={() => {
              firebase.auth().signOut();
            }}>تسجيل الخروج</Link>
            <NavLink to='/'>اطباء العيادة</NavLink>
            </> : <></>
        }

        {
            user.isPatient ?
            <>
                <Link to='/' onClick={() => {
              firebase.auth().signOut();
            }}>تسجيل الخروج</Link>
                <Link to='/' className={location.pathname === '/' ? 'active' : null}>سجلاتي</Link>
                <NavLink to='/reserve'>احجز اشعة</NavLink>
            </>: <></>
        }
        </div>
        <div className="burger-icon"><a href="#" onClick={(e) => {
          e.preventDefault();
          setToggled(!toggled);
        }}><AlignLeftOutlined /></a></div>
      </nav>
    );
  }
  