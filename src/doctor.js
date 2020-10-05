import React, { useContext, useState } from 'react';
import {useLocation, useHistory, NavLink} from 'react-router-dom';
import {Card, Col, Row, Divider, Form,Button, Table, Input, Select, Tag, Modal} from 'antd';
import logo from './images/logo.jpg';
import {studiesModel, userContext} from './App';
import {Link} from 'react-router-dom';
import {EditableTable, reshaped} from './kit';
import {doctorModel} from './App';
import {EditOutlined, AlignLeftOutlined} from '@ant-design/icons';
import { ReservationPage } from './start_page';



export const DoctorsList = ({clinicID, clinicName}) => {
    const user = useContext(userContext);
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

    const doctorsList = [doctorModel, doctorModel, doctorModel];
    return <div>
        <h2><center><b>{clinicName}</b></center></h2>
        <Table  columns={columns} scroll={{x: 300}} dataSource={doctorsList.map(doctor => {
        return {
            key: doctor.id,
            code: doctor.id,
            balance: doctor.balance,
            name: doctor.name,
            discount: doctor.discount,
            earns: doctor.earns,
            discountRadiations: doctor.discount.discountRadiations
        };
    })}/></div>
}

export default () => {
    const user = useContext(userContext);
    if(user.isAccountant) {
        return <div dir='ltr' style={{margin: 30, textAlign: 'left'}}><DoctorsList clinicName='مستشفي الشروق' /></div>;
    }

    return (
        <div className='container'>
            {reshaped(studiesModel, window.screen.availWidth < 680 ? (window.screen.availWidth < 460 ? 1 : 2) : 3).map((studies, i) => {

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


export const PreviewStudyPage = ({match, id}) => {
    const study = studiesModel[0];
  
    return (
      <div className='container' style={{backgroundColor: '#fff', margin: '20px', border: '0.1px solid #e2e2e2'}}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
              <h2>الاسم : {study.name}</h2>
          </Col>
          <Col span={12}>
            <h2 style={{textAlign: 'left'}}>الطبيب المسؤل : {study.doctorName}</h2>  
          </Col>
        </Row>
  
        <Row gutter={[16, 16]}>
            <h3>رقم الهاتف : {study.phoneNumber}</h3>
        </Row>
        <Row gutter={[16, 16]}>
            <h3>العنوان : {study.address}</h3>
        </Row>
        <Row gutter={[16, 16]}>
            <h3>الكود : {study.id}</h3>
        </Row>
        <Divider />
        <h3><b>صور الاشعة الخاصة بالمريض </b></h3>
        {study.radiations.map((radiation, i) => {
          
          return (
            <div key={i} className='radiation-content'>
                <img src={radiation.image} alt='#'/>
              <b style={{textAlign: 'center'}}>{radiation.type}</b>
              <i>{radiation.date.toDateString()}</i>
              <Divider />
            </div>
          );
        })}
        
      </div>
    );
  }
  

export const DoctorProfilePage = ({id, clinicID}) => {
  
    const user = useContext(userContext);
    const [discountUpdating, setDiscountUpdating] = useState(false);
    const [earnsUpdating, setEarnsUpdating] = useState(false);

    const dataUpdate = (field) => {
        console.log(field);
    }

    const imageUpdate = (field) => {

    }
    
    return (
    <div className='container'>
        <div>
            <div style={{backgroundColor: '#fff', backgroundImage: `url("${doctorModel.image}")`,
            backgroundPosition: 'center',
             backgroundSize: 'cover',
             marginLeft: 8,
             float: 'right',
              width: 130, height: 130}}/>
            <div>
            <h2><b>{doctorModel.name} </b> ({doctorModel.id})</h2>
                <h3>{doctorModel.specialization}</h3>
                <h3> في الحساب {doctorModel.balance} EGP</h3>
            </div>
        </div>
        <br/>
        <div dir='ltr' className='doctor-data-table'>
        <EditableTable doctor={doctorModel} originData={[
            {
                key: 0,
                element: 'الاسم',
                fieldName: 'name',
                value: doctorModel.name,
                onUpdate: dataUpdate,
                
                
            },
            {
                key: 1,
                element: 'رقم الهاتف',
                fieldName: 'phoneNumber',
                value: doctorModel.phoneNumber,
                onUpdate: dataUpdate
            },
            {
                key: 2,
                element: 'الصورة',
                fieldName: 'image',
                value: doctorModel.image,
                isImage: true,
                onUpdate: imageUpdate
            },
            {
                key: 3,
                element: 'تاريخ التعاقد',
                fieldName: 'contractionDate',
                value: doctorModel.contractionDate.toDateString(),
                onUpdate: dataUpdate,
                disabled: true 
            },
            {
                key: 4,
                element: 'كود',
                fieldName: 'id',
                value: doctorModel.id,
                onUpdate: dataUpdate,
                disabled: true 
            },
            {
                key: 5,
                element: 'اسم السكرتير',
                fieldName: 'secretaryName',
                value: doctorModel.secretaryName,
                onUpdate: dataUpdate,
            },
            {
                key: 6,
                element: 'الموظف المسؤل عن التعامل',
                fieldName: 'responsibleEmployee',
                value: doctorModel.responsibleEmployee,
                onUpdate: dataUpdate,
                disabled: user.isDoctor
            },
            {
                key: 7,
                element: 'رقم تيليفون السكرتير',
                fieldName: 'secretaryPhoneNumber',
                value: doctorModel.secretaryPhoneNumber,
                onUpdate: dataUpdate,
            },
            {
                key: 8,
                element: 'البريد الالكتروني',
                fieldName: 'email',
                value: doctorModel.email,
                onUpdate: dataUpdate,
            },
            {
                key: 9,
                element: 'رقم الواتس',
                fieldName: 'whatsAppNumber',
                value: doctorModel.whatsAppNumber,
                onUpdate: dataUpdate,
            },
            {
                key: 10,
                element: 'صورة الكارت',
                fieldName: 'cardImage',
                value: doctorModel.cardImage,
                onUpdate: imageUpdate,
                isImage: true
            }
        ]}/>
        </div>
        {
          ((user.isDoctor && doctorModel.showDiscount) || user.isAdmin) ?
        <div style={{margin: 10, padding: 13,
             backgroundColor: '#f8ffff',
             position: 'relative',
              border: '1px solid #a9d5de'}}>
            
            <h2 style={{color: '#0e566c', fontWeight: 'bold'}}>الخصم : {doctorModel.discount.value} {doctorModel.discount.type === 'value' ? 'EGP' : '%'}</h2>
            <ul>
                {doctorModel.discount.discountRadiations.map((i, j) => {
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
          ((user.isDoctor && doctorModel.showDiscount) || user.isAdmin) ?
        <div style={{margin: 10, padding: 13,
             backgroundColor: '#f8ffff',
             position: 'relative',
              border: '1px solid #a9d5de'}}>
            
            <h2 style={{color: '#0e566c', fontWeight: 'bold'}}>الربح : {doctorModel.earns.value} {doctorModel.earns.type === 'value' ? 'EGP' : '%'}</h2>
            {user.isAdmin ?

<Button style={{position: 'absolute', left: 10, top: 10}} type="text" icon={<EditOutlined />}/>:
<></>
            }
            
        
      <Modal visible={discountUpdating} onOk={() => {}} onCancel={() => setDiscountUpdating(false)}>
        <div style={{margin: 10}}>
          <Form>
            <Form.Item
            
            rules={[{
              required: true,
              message: 'لا يمكن ان تترك فارغة'
            }]}

            label='الخصم'
            >

              <Input />
              
            </Form.Item>
          </Form>
        </div>
      </Modal>
    
        </div>
        
      : <></>
      }
   
   </div>);
}

export const SearchPage = ({match}) => {
    const studies = [...studiesModel, ...studiesModel, ...studiesModel];
    return <div style={{padding: 15}}>

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

  return (
    <>
    <ReservationPage />
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
            <Link to='/' onClick={() => setToggled(false)}>تسجيل الخروج</Link>
            <NavLink to='/add-study' onClick={() => setToggled(false)}>اضافة مريض</NavLink>
            <NavLink to={`/profile/${user.uid}`} onClick={() => setToggled(false)}>حسابي</NavLink>
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
            <Link to='/' onClick={() => setToggled(false)}>تسجيل الخروج</Link>
            <NavLink to='/'>اطباء العيادة</NavLink>
            </> : <></>
        }

        {
            user.isPatient ?
            <>
                <Link to='/' onClick={() => setToggled(false)}>تسجيل الخروج</Link>
                <Link to='/'>سجلاتي</Link>
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
  