import { Layout, Menu, Card, Divider, DatePicker,
   Form, Button, TimePicker, Row, Col,Input, Progress ,InputNumber, Upload, message, Select, Radio, Table } from 'antd';
import { Switch, Route, useHistory } from 'react-router-dom';
import React, {useState, Component, useEffect, useContext} from 'react';
import {Link} from 'react-router-dom';
import {userContext} from './App';
import logo from './images/logo.jpg';
import './stylesheets/admin.css';
import * as firebase from 'firebase/app';
import {
  DesktopOutlined,
  PieChartOutlined,
  BarChartOutlined,
  FieldTimeOutlined,
  UserOutlined,
  BorderInnerOutlined,
  AreaChartOutlined,
  UsergroupAddOutlined,
  EyeTwoTone,
  IdcardOutlined,
  LogoutOutlined,
  UploadOutlined,
  UpOutlined,
  CloseOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';


import { Page404, EditableField, reshaped, Loader, timeStampToDate, usePagination } from './kit';
import { ReservationPage } from './start_page';
import { useLocation, NavLink } from 'react-router-dom/cjs/react-router-dom.min';
import { PreviewStudyPage, DoctorProfilePage } from './doctor';

const { Content,Sider } = Layout;

const ReservationCardForm = ({reservation}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false);
  return (
    <Form form={form} dir='ltr'>
      <Row>
        <Col flex='auto'>
          <Form.Item  name='date'
          
          rules={[{
            required: true,
            message: 'يجب تحديد اليوم'
        }]}
          >
              <DatePicker dir='ltr' />
          </Form.Item>
        </Col>
        <Col flex='auto'>
          <Form.Item name='time'
          
          rules={[{
              required: true,
              message: 'يجب تحديد التوقيت'
          }]}
          >
              <TimePicker  dir='ltr' />
          </Form.Item>
        </Col>

        <Col flex='50px'>
          <Button disabled={loading} onClick={async () => {
            const data = await form.validateFields();
            setLoading(true);
            const date = data.date._d;
            const time = data.time._d;
            
            let doctorEarns = null;
            let moneyToPay = 0;
            
            if(reservation.doctor) {
              let doc = await firebase.firestore().collection('doctors').doc(reservation.doctor.id).get();
              let {discount, earns} = doc.data();
              
              for(let i in reservation.radiations) {
                let radiation = reservation.radiations[i];
                if(discount.radiations.indexOf(radiation.price) === -1) {
                  moneyToPay += radiation.price;
                }else {
                  if(discount.type === 'value') {
                    moneyToPay += radiation.price - discount.value;
                  }else {
                    moneyToPay += radiation.price*(1 - discount.value/100);
                  }
                }
              }
              
              if(earns.type === 'value') {
                doctorEarns = earns.value;
              }else {
                doctorEarns = moneyToPay*(earns.value/100);
              }
            }else {
              reservation.radiations.forEach(r => moneyToPay+=r.price);
            }

            let day = parseInt(date.toDateString().split(' ')[2]); // mkanet4 3ayza t4t8al 8er kda :)
            
            firebase.firestore().collection('reservations').doc(reservation.phoneNumber).update({
              accepted: true,
              date: new Date(date.getFullYear(), date.getMonth(),
               day, time.getHours(), time.getMinutes(), time.getSeconds()),
               moneyToPay: moneyToPay,
               doctorEarns: doctorEarns
            });

            window.alert('تم حجز الموعد بنجاح');
        
          }} htmlType='submit'>اتمام الحجز</Button>
        </Col>
        <Col style={{marginLeft:5, marginTop: window.screen.availWidth < 357 ? 5 : 0}} flex='50px'>
          <Button disabled={loading} onClick={() => firebase.firestore().collection('reservations').doc(reservation.phoneNumber).delete()} danger htmlType='submit'>رفض الطلب</Button>
        </Col>
      </Row>
    </Form>
  );
}


const StudyReservationCard = ({reservation}) => {

  const [loading, setLoading] = useState(false);


  return (
    <Card key={reservation.phoneNumber} style={{marginTop: 17}} title={reservation.name}>
      <p> رقم الهاتف : {reservation.phoneNumber} </p>
      <p> الطبيب المسؤل  : {reservation.doctor ? reservation.doctor.name : 'طبيب غير متعاقد معه'} </p>
      <p> المبلغ المطلوب  : <b>{reservation.moneyToPay} EGP </b></p>
      <p> اليوم : {reservation.date.toLocaleDateString()}</p>
      <p> الميعاد :  {reservation.date.toLocaleTimeString()} </p>
      <b>الاشعة المطلوبة</b>
      <ul>
          {reservation.radiations.map((r, i) => <li key={i}>{r.name}</li>)}
      </ul>

      <Divider />
      <Row>
        <Col flex='auto'>
          <Button onClick={async () => {
            if(window.confirm('برجاء تأكيد عملية الدفع')) {
              setLoading(true);
              let res = await firebase.functions().httpsCallable('createPatient')(reservation);

              if(reservation.doctorEarns) {
                firebase.firestore().collection('doctors').doc(reservation.doctor.id).get().then(doc => {
                  firebase.firestore().collection('doctors').doc(reservation.doctor.id).update({
                    balance: doc.data().balance + reservation.doctorEarns
                  });
                });
              }

              await firebase.firestore().collection('logs').doc().set({
                code: res.data.patientCode,
                date: new Date(),
                doctorName: reservation.doctor ? reservation.doctor.name : 'غير متعاقد معه',
                studyName: reservation.name,
                radiations: reservation.radiations.map(r => r.name),
                totalPayed: reservation.moneyToPay,
                totalRecieved: reservation.moneyToPay - (reservation.doctorEarns ? reservation.doctorEarns : 0)
              });
              
              firebase.firestore().collection('reservations').doc(reservation.phoneNumber).delete();
              message.success('تمت عملية الدفع بنجاح !');
            }
          }} disabled={loading} style={{width: '95%'}} type='primary'>تم الدفع</Button>
        </Col>

        <Col flex='auto'>
          <Button onClick={() => {
            if(window.confirm('هل انت متأكد تود الغاء الحجز ؟')) {
              setLoading(true);
              firebase.firestore().collection('reservations').doc(reservation.phoneNumber).delete();
            }
          }} disabled={loading} style={{width: '95%'}} danger type='primary'>الغاء الحجز</Button>
        </Col>
      </Row>
  </Card>
  );
  
}

const AcceptedReservationsPage = () => {
  const [acceptedReservations, setReservations] = useState(undefined);

  useEffect(() => {
    const unsubscribe = firebase.firestore().collection('reservations').where('accepted', '==', true).onSnapshot(sn => {
      setReservations(sn.docs.map((doc) => {
        let data = doc.data();
        data.date = timeStampToDate(data.date);
        return {...data,phoneNumber: doc.id};
      }));
    });

    return unsubscribe
  }, []);
  if(acceptedReservations === undefined) {
    return <Loader />;
  }

  if(acceptedReservations.length === 0) {
    return <center><h1>لا يوجد حتي الان اي معاد </h1></center>;
  }
  return (
    acceptedReservations.map(reservation => {

      return <StudyReservationCard key={reservation.phoneNumber} reservation={reservation}/>;
    })
  );
}

const ReservationsPage = () => {
    const [reservations, setReservations] = useState(undefined);

    useEffect(() => {
      let unsubscribe = firebase.firestore().collection('reservations').where('accepted', '==', false).onSnapshot((sn) => {
        setReservations(sn.docs.map(doc => {

          return {phoneNumber: doc.id, ...doc.data()};
        }));
      });

      return unsubscribe;
    }, []);
    if(reservations === undefined) return <Loader />;
    return (
        <div>
          <h1 style={{margin: 20}}>الطلبات</h1>
          {reservations.length === 0 ? <h3 style={{marginRight: 25}}>لا توجد طلبات الي الان</h3> : <></>}
            {reservations.map(reservation => {
                return (
                <Card key={reservation.phoneNumber} style={{marginTop: 17}} title={reservation.name}>
                    <p> رقم الهاتف : {reservation.phoneNumber} </p>
                    <p> الطبيب المسؤل  : {reservation.doctor ? reservation.doctor.name : 'طبيب غير متعاقد معه'} </p>
                    <b>الاشعة المطلوبة</b>
                    <ul>
                        {reservation.radiations.map((r, i) => <li key={i}>{r.name}</li>)}
                    </ul>

                    <Divider />
                    <ReservationCardForm  reservation={reservation}/>
                </Card>
                );
            })}
        </div>
    );
}


const SideMenu = () => {
  const [collapsed, setCollapsed] = useState(window.screen.availWidth < 600);
  const history = useHistory();
  const location = useLocation();
  const admin = useContext(userContext);
  const navigate = (menuItem) => {
      history.push(menuItem.key);
  }
  return (
      <Sider collapsible collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)}>
      <div style={{backgroundImage: `url(${logo})`, width: '100%',height: 90,marginTop: 10, backgroundPosition: 'center', backgroundSize: 'cover'}} />
      <Menu  defaultSelectedKeys={[location.pathname]} mode="inline">
      {admin.adminDegree > 1? 

        <Menu.SubMenu key="admins-sub" title='الادمنز' icon={<UserOutlined />}>
        <Menu.Item onClick={navigate} key='/admins'>الادمنز</Menu.Item>
        <Menu.Item onClick={navigate} key='/add-admin'>اضافة ادمن</Menu.Item>
        </Menu.SubMenu> 
      : <></>}
        <Menu.Item onClick={navigate} key="/" icon={<PieChartOutlined />}>
          طلبات الحجوزات
        </Menu.Item>
        <Menu.Item onClick={navigate} key="/accepted-reservations" icon={<FieldTimeOutlined />}>
          المواعيد
        </Menu.Item>

        {admin.adminDegree > 1 ? 
            <Menu.SubMenu icon={<DesktopOutlined />} title='العيادات' key='clinics-sub'>
            <Menu.Item onClick={navigate} key="/clinics">
              جميع العيادات
            </Menu.Item>
            <Menu.Item onClick={navigate} key="/add-clinic">
              اضافة عيادة
            </Menu.Item>
            </Menu.SubMenu> 
        : <></>}
        
        <Menu.Item onClick={navigate} key="/logs" icon={<BarChartOutlined />}>
          التعاملات
        </Menu.Item>

        <Menu.Item onClick={navigate} key="/patients" icon={<IdcardOutlined />}>
          العملاء
        </Menu.Item>

        <Menu.Item onClick={navigate} key="/add-patient" icon={<UsergroupAddOutlined />}>
          اضافة عميل
        </Menu.Item>
        
        <Menu.Item onClick={navigate} key="/radiations-upload" icon={<AreaChartOutlined />}>
             رفع اشعة العملاء
        </Menu.Item>

        {admin.adminDegree > 1 ? 
        
        <Menu.Item onClick={navigate} key="/radiations" icon={<BorderInnerOutlined />}>
          الاشعة المتاحة
        </Menu.Item> : <></>
        }
        
        <Menu.Item onClick={() => {
          firebase.auth().signOut();
        }} key="/logout" icon={<LogoutOutlined />}>
           تسجيل الخروج
        </Menu.Item>
      </Menu>
    </Sider>
    
  );
}

/*
<Menu.Item onClick={navigate} key="/resources" icon={<ClusterOutlined />}>
          المخزن
</Menu.Item>
*/


const RadiationsPage = () => {
  const [form] = Form.useForm();
  const [radiations, setRadiations] = useState(undefined);

  useEffect(() => {
    firebase.firestore().collection('radiations').get().then(sn => {
      setRadiations(sn.docs.map(doc => {return {...doc.data(), id: doc.id}}));
    }).catch(() => {
      setRadiations([]);
    });
  }, []);
  if(radiations === undefined) {
    return <Loader />;
  }

  return (
    <div style={{margin: 10}}>
      <div style={{background: '#fff', padding: 15}}>
        <h1>اضافة اشعة جديدة</h1>
        <Form form={form}>
          <Form.Item
          name='name'
          label='اسم الاشعة'
          rules={[{
            required: true,
            message: 'يرجي ادخال اسم الاشعة'
          }]}>
            <Input/>
          </Form.Item>

          <Form.Item
          name='message'
          label='الوقت المتاح'
          rules={[{
            required: true,
            message: ' برجاء تحديد الوقت التي تكون فيه تلك الاشعة متاحة  '
          }]}>
            <Input placeholder='مثال : متاح من الساعة الثامة صحباحا حتي الثالثة مسائا ايام الخميس و الاربعاء   '/>
          </Form.Item>

          <Form.Item
          name='price'
          label='التكلفة'
          rules={[{
            required: true,
            message: 'برجاء تحديد تكلفة تلك الاشعة'
          }]}>
            <InputNumber />
          </Form.Item>

          <Button onClick={async () => {
            const data = await form.validateFields();
            const id = Math.random()*10000000000000000;
            const radiation = {
              name: data.name,
              price: data.price,
              message: data.message
            };
            await firebase.firestore().collection('radiations').doc(`${id}`).set(radiation);
            form.setFieldsValue({
              name: '',
              price: '',
              message: ''
            });

            setRadiations([{...radiation, id: `${id}`}, ...radiations]);
            
          }} className='btn-expanded' type='primary' htmlType='submit'>تسجيل</Button>
        </Form>
      </div>
      <h1 style={{margin: '15px 5px', fontSize: 23}}>الاشعة المتوافرة</h1>
      {radiations.length === 0? <h3>لا يوجد حتي الان</h3> : <></>}
      {radiations.map((radiation, i) => {

        return (
          <div key={radiation.id} style={{margin: 20, padding: 13, background: '#fff'}}>
            <Row>
              <h3>اسم الاشعة : </h3>
              <h3 style={{marginRight: 5}}><b>{radiation.name}</b></h3>
            </Row>

            <Row>
              <h3> مواعيد الاشعة : </h3>
              <EditableField onUpdate={(msg) => {
                radiation.message = msg;
                firebase.firestore().collection('radiations').doc(radiation.id).update({
                  message: msg
                });

                setRadiations([...radiations]);
              }} initialValue={radiation.message}>
                <h3 style={{marginRight: 5}}><b>{radiation.message}</b></h3>
              </EditableField>
            </Row>
            
            <Row>
              <h3> التكلفة : </h3>
              <EditableField onUpdate={(price) => {
                radiation.price = price;
                firebase.firestore().collection('radiations').doc(radiation.id).update({
                  price: price
                });

                setRadiations([...radiations]);
              }} number initialValue={radiation.price}>
                <h3 style={{marginRight: 5}}><b>{radiation.price} EGP</b></h3>
              </EditableField>
            </Row>
            
            <a onClick={() => {
              if(!window.confirm(`هل انت متأكد تريم مسح بيانات ${radiation.name}`)) return;
              setRadiations(radiations.filter(r => r !== radiation));
              firebase.firestore().collection('radiations').doc(radiation.id).delete();
            }} style={{color: 'red', textDecoration: 'underline'}}>مسح البيانات</a>
          </div>
        );
      })}
    </div>
  );
}

class RadiationsUploadPage extends Component {
  // mkanet4 radya tt3ml function :)

  state = {fileList: [], radiationTypes: undefined, uploadProgress: -1}

  isWellFormatted(file) {
    if(file.name.split('_').length !== 2) return false;
    let rCode = parseInt(file.name.split('_')[1]);
    return !(rCode >= this.state.radiationTypes.length || rCode < 0) 
  }

  componentDidMount() {
    firebase.firestore().collection('radiations').get().then(sn => {
      this.setState({...this.state, radiationTypes: sn.docs.map( doc => doc.data())});
    });
    
  }

  async uploadFile(file) {
    let [code, radiation] = file.name.split('_');
    let key = Math.random()*100000000000 + '';
    radiation = parseInt(radiation);

    try {
      await firebase.firestore().collection('studies').doc(code).update({
        radiations: firebase.firestore.FieldValue.arrayUnion({
          image: `patients/${code}/${key}`,
          date: new Date(),
          radiationType: this.state.radiationTypes[radiation].name
        })
      });

      await firebase.storage().ref().child(`patients/${code}/${key}`).put(file);

      this.setState(state => {
        return {...state, uploadProgress: state.uploadProgress + (1/state.fileList.length)*100}
      });
    }catch {
      this.setState(state => {
        return {...state, status: 'exception', errorMessage: `الكود ${code} غير موجود`};
      })
    }
    
  }

  render() {

    if(!this.state.radiationTypes) {
      return <Loader />
    }

    return (
      <div dir='ltr' style={{height: '90%', display: 'flex',
       flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center'}}>

        <Table columns={[{
          title: 'code',
          dataIndex: 'code',
          key: 'code'
        },
        {
          title: 'name',
          dataIndex: 'name',
          key: 'name'
        }]}

        style={{width: 300}}
        
        dataSource={this.state.radiationTypes.map((r, i) => {
          return {key: i, name: r.name, code: i};
        })}/>

        <Upload fileList={this.state.fileList} accept='image/*' multiple 
        
        beforeUpload={(file) => {
          if(this.isWellFormatted(file)) {
            
            this.setState(state => {
              return {
                ...state,
                fileList: [...state.fileList, file]
              }
            });
          }else {
            
            this.setState((state) => {
              
              return {
              ...state,
              fileList: [...state.fileList]
            }});

            message.error(`الملف ${file.name} غير مركب بشكل صحيح`);
          }
          
          return false;
        }}

        
        onRemove={file => {
          this.setState(state => {
            
            return {
              ...state,
              fileList: state.fileList.filter(f => f.name !== file.name)
            }
          });
        }}>
          <Button icon={<UploadOutlined />}>اختر الصور</Button>
        </Upload>

        <Button onClick={() => {
          this.setState(state => {
            return {...state, uploadProgress: 0};
          })
          this.state.fileList.forEach((file) => this.uploadFile(file));
        }} disabled={this.state.fileList.length === 0 || this.state.uploadProgress !== -1}  type='primary' style={{marginTop: 10}}>ابدأ الرفع</Button>
        {
          this.state.uploadProgress !== -1?
          <Progress style={{margin: 20}} type='circle' status={this.state.status}  percent={Math.ceil(this.state.uploadProgress)}/> : <></>}
          {this.state.errorMessage ? <h3 style={{color: 'red'}}>{this.state.errorMessage}</h3> : <></>}
      </div>
    );
  }
}


const LogsPage = () => {

  const [data, setLogs] = usePagination({path: 'logs', load_count: 12, order: 'desc'});

  let logs = data.data;
  
  if(!logs) {
    return <Loader />;
  }

  if(data.noObjects) {
    return <h1>لا توجد تعاملات مسجلة</h1>;
  }
  return (
    <div style={{margin: 15}}>
      <h1 ><b>اخر التعاملات</b></h1>
      {reshaped(logs, 3).map((arr, i) => {

        return <Row key={i} gutter={[12,12]}>
          {arr.map(log => <Col key={log.id} flex='auto'>
          <div className='card'>
          <h4>اسم المريض : {log.studyName}</h4>
          <h4>الطبيب المتابع : {log.doctorName}</h4>
          <h4>كود المريض : {log.code}</h4>
          <h3><b>الاشعة</b></h3>
          <ul>
          {log.radiations.map(radiation => <li key={radiation}>{radiation}</li>)}
          </ul>
          <h4> اجمالي المبلغ المدفوع  : {log.totalPayed} EGP</h4>
          <h4>   الربح  : <b style={{color: 'green'}}>{log.totalRecieved} EGP</b></h4>
          <h4>تاريخ العملية : {timeStampToDate(log.date).toLocaleDateString()} {timeStampToDate(log.date).toLocaleTimeString()}</h4>
          </div>
          </Col>)}
        </Row>
      })}
    </div>
  );
}

const AddAdminPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  return (
    <div className='start-container'>
      <div className='login-form'>
        <center><h1>اضافة ادمن</h1></center>
        <Form form={form}>
          <label>الاسم</label>
          <Form.Item
          name='username'
          rules={[
            {
              required: true,
              message: 'يجب ادخال اسم الادمن بشكل صحيح بالانجليزية',
              pattern: /^[a-zA-Z]+$/
             
            }
          ]}
          >
            <Input />
          </Form.Item>

          <label>كلمة المرور</label>
          <Form.Item
          name='password'
          rules={[
            {
              required: true,
              min: 6,
              message: 'يجب الا تقل كلمة المرور عن ستة احرف'
            }
          ]}
          >
            <Input.Password
  
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item
          name='degree'
          rules={[
            {
              required: true,
              message: 'يجب اختيار نوع الادمن'
            }
          ]}
          >
            <Radio.Group>
            <Radio value={2}>مدير</Radio>
              <Radio value={1}>سكرتير او غيره</Radio>
            </Radio.Group>
          </Form.Item>

          <Button dir='ltr' loading={loading} onClick={async () => {
            const data = await form.validateFields();
            setLoading(true);
            
            let res = await firebase.functions().httpsCallable('createAdmin')({
              email: `${data.username}@ganna.com`,
              password: data.password,
              adminDegree: data.degree
            });

            if(res.data.ok) {
              await firebase.firestore().collection('admins').doc(res.data.adminID).set({
                name: data.username,
                password: data.password,
                degree: data.degree
              });

              setLoading(false);
              form.setFieldsValue({
                username: '',
                password: '',
                degree: ''
              });
              return message.success('تم اضافة الادمن بنجاح');
            }

            message.error('Oops, some thing went wrong');
          }} className='btn-expanded' type='primary' htmlType='submit'>اضافة</Button>
        </Form>
      </div>
    </div>
  );
}


const PatietnsPageBody = ({searchValue, searchType}) => {
  const [data, setData] = usePagination({
    path: 'studies',
    load_count: 13,
    where: searchValue ? `${searchType} == ${searchValue}` : null 
  });
  
  const results = data.data;
  if(data.noObjects && searchValue.length !== 0) {
    return <h2 dir='ltr'>{searchType} '{searchValue}' doesn't exist :(</h2>
  }
  if(data.noObjects) {
    return <h2>لا يوجد عملاء مسجلين حاليا</h2>;
  }

  return (

    <div style={{margin: 10}}>
    {reshaped(results, 4).map((res, i) => {

      return <Row gutter={[16,16]} key={i}>
        {res.map((k, j) => 
          <Col flex='auto' key={k.id}>
            <Link to={`preview-study/${k.id}`}>
              <div className='card'>
                  <h4>الاسم : {k.name}</h4>
                  <h4>الكود : {k.id}</h4>
                  <h4>رقم الهاتف : {k.phoneNumber}</h4>
              </div>
            </Link>
          </Col>
       )}
      </Row>
    })}
  </div>

  );
}

const PatientsPage = () => {

  const [searchValue, setSearchValue] = useState('');
  const [searchType, setType] = useState('name');
  
  return (
    <div>
      <div dir='ltr'  style={{margin: 35}}>
          <Input.Search onSearch={(val) => setSearchValue(val)} addonAfter={
          <Select onChange={val => setType(val)} defaultValue={searchType}>
            <Select.Option value='name'>الاسم</Select.Option>
            <Select.Option value='code'>الكود</Select.Option>
            <Select.Option value='phoneNumber'>رقم الهاتف</Select.Option>
          </Select>} />
      </div>

      <PatietnsPageBody searchValue={searchValue.trim()} searchType={searchType} />
    </div>
  );
}


const AdminsPreviewPage = () => {

  const [admins, setAdmins] = useState(undefined);

  useEffect(() => {
    firebase.firestore().collection('admins').onSnapshot((sn) => {
      setAdmins(sn.docs.map(d => {
        return {...d.data(), id: d.id};
      }));
    });
  }, []);
  if(admins === undefined) {
    return <Loader />;
  }
  
  return <div style={{margin: 20}}>
    <h1 style={{marginTop: 10, marginBottom: 10}}>المديرين</h1>
    {reshaped(admins.filter(i => i.degree > 1), 3).map((adminsRow, i) => {
      return <Row gutter={[16, 16]} key={i}>
        {adminsRow.map(admin => {
          return <Col flex='auto'><div className='card' key={admin.id}>
              <h3>الاسم : {admin.name}</h3>
              <h3>كلمة السر : {admin.password}</h3>
          </div></Col>
        })}
      </Row>;
    })}

    <h1 style={{marginTop: 10, marginBottom: 10}}>السكرترية و الاخرين</h1>
    
    {reshaped(admins.filter(i => i.degree === 1), 3).map((adminsRow, i) => {
      return <Row gutter={[16, 16]} key={i}>
        {adminsRow.map(admin => {
          return <Col flex='auto'><div className='card' key={admin.id}>
              <h3>الاسم : {admin.name}</h3>
              <h3>كلمة السر : {admin.password}</h3>
              <Button onClick={async () => {
                if(window.confirm(`هل انت متأكد تريد مسح حساب ${admin.name} ؟`)) {
                  let res = await firebase.functions().httpsCallable('deleteAdmin')({
                    adminID: admin.id
                  });

                  if(res.data.ok) {
                    return await firebase.firestore().collection('admins').doc(admin.id).delete()
                  }

                  message.error('Oops, something went wrong');
                }
              }} danger>مسح الحساب</Button>
          </div></Col>
        })}
      </Row>;
    })}

  </div>;
}


const ClinicsPage = () => {
  const [clinics, setClinics] = useState(undefined);


   useEffect(() => {
     (async () => {
       const fs = firebase.firestore();
       let allClinics = (await fs.collection('clinics').get()).docs.map(doc => {
         let data = doc.data();
         if(data.doctors.length === 0) {
           data.doctors = [{0: 'لا يوجد اطباء مسجلين'}];
         }
         
        return {...data, id: doc.id};
       });

       setClinics(allClinics);
     })();
   }, []);

   if(clinics === undefined) {
     return <Loader />;
   }
   return <div style={{padding: 20}}>
     <h1>العيادات المتعاقد معها</h1>
     {clinics.length === 0 ? <h3>لا توجد عيادات حتي الان</h3>: reshaped(clinics, 3).map((arr, i) => {

       return <Row key={i} gutter={[16, 16]}>
         {arr.map(clinic => {
           return <Col key={clinic.id} flex='auto'>
             <Link style={{color: 'black'}} to={`/clinics/${clinic.id}`}>
              <div style={{border: '2px solid dodgerblue'}} className='card'>
                  <h3><b>{clinic.name}</b></h3>
                  <p>الاطباء</p>
                  <ul>
                      {clinic.doctors.map(doctor => <li key={Object.keys(doctor)[0]}>{Object.values(doctor)[0]}</li>)}
                  </ul>
              </div>
             </Link>
             </Col>
         })}
       </Row>
     })}
   </div>
}

const ClinicPage = ({match}) => {
  const location = useLocation();
  

  return <div className='clinic-page'>
    <div className='clinic-aside card'>
      <Link className={location.pathname.split('/').length === 3 ? 'active' : ''} to={`/clinics/${match.params.id}`}>بيانات العيادة</Link>
      <NavLink to={`/clinics/${match.params.id}/add-accountant`}>اضافة محاسب</NavLink>
      <NavLink to={`/clinics/${match.params.id}/add-doctor`}>اضافة طبيب</NavLink>
    </div>
    
    <Switch>
      <Route path='/clinics/:id/add-accountant' component={ClinicAddAccountantRoute}/>
      <Route path='/clinics/:id/add-doctor' component={AddDoctorRoute}/>
      <Route exact path='/clinics/:id' component={ClinicInfoRoute}/>
    </Switch>
  </div>;
}

const AddDoctorRoute = ({match}) => {

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  
  return (
    <div style={{width: '100%', padding: 20,
     display: 'flex', justifyContent: 'center',
      alignItems: 'center', height: '100%'}}>
        <div style={{width: 'auto'}} className='login-form'>
          <center><h1>اضافة طبيب</h1></center>
        <Form form={form}>
          <label>الاسم</label>
          <Form.Item
          name='username'
          rules={[
            {
              required: true,
              message: 'يجب ادخال الاسم '
            }
          ]}
          >
            <Input />
          </Form.Item>

          <label>رقم الهاتف</label>
          <Form.Item
          name='phoneNumber'
          rules={[
            {
              required: true,
              message: 'يجب ادخال رقم الهاتف'
            }
          ]}
          >
            <Input />
          </Form.Item>

          <label>التخصص</label>
          <Form.Item
          name='specialization'
          rules={[
            {
              required: true,
            }
          ]}
          >
            <Select >
                <Select.Option value='المعالجة اللبية Endodontic'>المعالجة اللبية Endodontic</Select.Option>
                <Select.Option value='طب دواعم الأسنان Periodontic'>طب دواعم الأسنان Periodontic</Select.Option>
                <Select.Option value='تقويم الأسنان Orthodontic'>تقويم الأسنان Orthodontic</Select.Option>
                <Select.Option value='جراحة الفم والوجه والفكين Oral and Maxillofacial surgery'>جراحة الفم والوجه والفكين Oral and Maxillofacial surgery</Select.Option>
                <Select.Option value='طب أسنان الأطفال pediatric'>طب أسنان الأطفال pediatric</Select.Option>
                <Select.Option value='الصحة العامة للأسنان Dental public health'>الصحة العامة للأسنان Dental public health</Select.Option>
                <Select.Option value='أمراض الفم والوجه والفكين Oral and Maxillofacial pathology'>أمراض الفم والوجه والفكين Oral and Maxillofacial pathology</Select.Option>
                <Select.Option value='أشعة الفم والوجه Oral and Maxillofacial radiology'>أشعة الفم والوجه Oral and Maxillofacial radiology</Select.Option>
            </Select>
          </Form.Item>

          <label>الكود</label>
          <Form.Item
          name='code'
          rules={[
            {
              required: true,
              message: 'يجب ادخال كود الطبيب'
            }
          ]}
          >
            <Input />
          </Form.Item>

          <label>كلمة المرور</label>
          <Form.Item
          name='password'
          rules={[
            {
              required: true,
              min: 6,
              message: 'يجب الا تقل كلمة المرور عن ستة احرف'
            }
          ]}
          >
            <Input.Password
  
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Button onClick={async () => {
            
            await form.validateFields();
            setLoading(true);
            const data = form.getFieldsValue();

            data.clinicID = match.params.id;
            let res = await firebase.functions().httpsCallable('createDoctor')({
              password: data.password,
              code: data.code,
              clinicID: match.params.id
            });

            if(res.data.ok) {
              const doctor = {uid: data.code};
              await firebase.firestore().collection('doctors').doc(doctor.uid).set({
                name: data.username,
                clinicID: match.params.id,
                discount: {
                    radiations: [],
                    type: 'value',
                    value: 0,
                },
                earns: {
                    type: 'percentage',
                    value: 0
                },
                balance: 0,
            });

           
            let obj = {};
            
            obj[doctor.uid] = data.username;
            await firebase.firestore().collection('clinics').doc(data.clinicID).update({
                doctors: firebase.firestore.FieldValue.arrayUnion(obj)
            });

            await firebase.firestore().collection('clinics').doc(data.clinicID).collection('doctors').doc(doctor.uid).set({
                name: data.username,
                phoneNumber: data.phoneNumber,
                image: null,
                contractionDate: new Date(),
                secretaryName: null,
                responsibleEmployee: null,
                secretaryPhoneNumber: null,
                email: null,
                whatsAppNumber: null,
                cardImage: null,
                specialization: data.specialization,
                password: data.password,
                showDiscount: false,

            });

            try {
              await firebase.firestore().collection('doctors').doc('all').update(
                {
                  doctors: firebase.firestore.FieldValue.arrayUnion(obj)
              });

            }catch {
              await firebase.firestore().collection('doctors').doc('all').set(
                {
                  doctors: [obj]
              }
              );
            }      

            history.push(`/doctor-preview/${match.params.id}/${doctor.uid}`);
            }else {
              message.error(res.data.message);
              setLoading(false);
            }
          }} loading={loading} dir='ltr' className='btn-expanded' type='primary' htmlType='submit'>اضافة</Button>
        </Form>

        </div>

    </div>
  );
}

const ClinicAddAccountantRoute = ({match}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  return (
    <div style={{width: '100%', padding: 20,
     display: 'flex', justifyContent: 'center',
      alignItems: 'center', height: '100%'}}>
        <div className='login-form'>
          <center><h1>اضافة محاسب</h1></center>
        <Form form={form}>
          <label>الاسم</label>
          <Form.Item
          name='username'
          rules={[
            {
              required: true,
              message: ' يجب ادخال الاسم',
              
            }
          ]}
          >
            <Input />
          </Form.Item>

          <label>رقم الهاتف</label>
          <Form.Item
          name='phoneNumber'
          rules={[
            {
              required: true,
              message: 'يجب ادخال رقم الهاتف'
            }
          ]}
          >
            <Input />
          </Form.Item>

          <label>كلمة المرور</label>
          <Form.Item
          name='password'
          rules={[
            {
              required: true,
              min: 6,
              message: 'يجب الا تقل كلمة المرور عن ستة احرف'
            }
          ]}
          >
            <Input.Password
  
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Button onClick={async () => {
            await form.validateFields();
            const data = form.getFieldsValue();
            setLoading(true);
            try {
              let res = await firebase.functions().httpsCallable('createAccountant')({
                email: `${data.phoneNumber}@ganna.com`,
                password: data.password,
                name: data.username,
                phoneNumber: data.phoneNumber,
                clinicID: match.params.id
              });

              if(res.data.ok) {
                form.setFieldsValue({
                  username: '',
                  password: '',
                  phoneNumber: ''
                });
  
                message.success('تم اضافة حساب المحاسب بنجاح');
                setLoading(false);
              }
  
          }catch(e) {
            message.error('يوجد محاسب مسجل برقم الهاتف هذا بالفعل');
            setLoading(false);
          }

          }} dir='ltr' loading={loading} className='btn-expanded' type='primary' htmlType='submit'>اضافة</Button>
        </Form>

        </div>

    </div>
  );
}

const ClinicInfoRoute = ({match}) => {
  const [clinic, setClinic] = useState(undefined);

  const [accountants, setAccountants] = useState(undefined);

  useEffect(() => {
    (async () => {
      const fs = firebase.firestore();
      let clinic = await fs.collection('clinics').doc(match.params.id).get();
      let accountantsCol = await fs.collection('clinics').doc(match.params.id).collection('accountants').get();
      accountantsCol = accountantsCol.docs.map(d => {

        return {...d.data(), id: d.id};
      });

      setClinic(clinic.data());
      setAccountants(accountantsCol);
    })();
  }, []);

  if(!(accountants && clinic)) {
    return <Loader />;
  }

  return <div style={{width: '100%', padding: 20}}>
  <center><h1>عيادة {clinic.name}</h1></center>
  <div style={{background: '#fff', padding: 10}}>
    <h2><b>المحاسبين</b></h2>
    {
      accountants.length === 0 ?
      <ul>
        <h3>لا يوجد محاسبين مسجلين</h3>
      </ul>
      :accountants.map(accountant => {

        return <div key={accountant.id}>
            <h4>اسم المحاسب: {accountant.name}</h4>
            <h4>رقم الهاتف: {accountant.phoneNumber}</h4>
            <h4>كلمة المرور: {accountant.password}</h4>
            <Divider />
        </div>
      })
    }
  </div>

  <div style={{background: '#fff', padding: 10, marginTop: 15}}>
    <h2><b>الاطباء</b></h2>
    <ul>
      {clinic.doctors.length === 0 ?
      
      <h3>لا يوجد اطباء مسجلين</h3>: 
      
      clinic.doctors.map(doctor => {
        const docId = Object.keys(doctor)[0];
          return <li key={docId}><Link to={`/doctor-preview/${match.params.id}/${docId}`}>{Object.values(doctor)[0]}</Link></li>;
      })
      }
      
    </ul>
  </div>
</div>


}

const AddClinicPage = () => {
  const [form] = Form.useForm();
  return (
    <div className='start-container'>
      <div className='login-form'>
        <center><h1>اضافة العيادة</h1></center>
        <Form form={form}>
          <label>اسم العيادة</label>
          <Form.Item
          name='clinicName'
          rules={[
            {
              required: true,
              message: 'يجب ادخال اسم العيادة'
            }
          ]}
          >
            <Input />
          </Form.Item>

          <Button onClick={() => {
            
            form.validateFields().then(() => {
              if(!window.confirm(`هل انت متأكد من انك تريد اضافة عيادة "${form.getFieldValue('clinicName')}"`)) return;
              firebase.firestore().collection('clinics').doc().set({
                name: form.getFieldValue('clinicName'),
                doctors: []
              }).then(() => {
                form.setFieldsValue({clinicName: ''});
                message.success('تمت اضافة العيادة بنجاح');
              })
            });
          }} className='btn-expanded' type='primary' htmlType='submit'> اضف العيادة</Button>
        </Form>
      </div>
    </div>
  );
}


export default () => {
    
    return (
        <Layout dir='ltr' style={{ minHeight: '100vh' }}>
       <Layout className="site-layout">
           <SideMenu />
          <Content dir='rtl' style={{ margin: '10px 16px 0px 16px' }}>
              <Switch>
                  <Route path='/' exact component={ReservationsPage}/>
                  <Route path='/add-patient'><ReservationPage onSubmit={async (data) => {

                    try {
                      let res = await firebase.functions().httpsCallable('makeReservation')({
                        name: data.name,
                        doctor: data.doctor === 'other' ? null : {
                          id: Object.keys(data.doctor)[0],
                          name: Object.values(data.doctor)[0]
                        },
                        phoneNumber: data.phoneNumber,
                        radiations: data.radiations.map(r => {
                          return r.id;

                        }),
                        address: data.address
                      });

                      if(res.data.ok) {
                        window.alert('تم الحجز بنجاح');
                      }
                  }catch {
                    window.alert('Oops, something went wrong');
                  }
                  }} /></Route>
                  <Route path='/accepted-reservations' component={AcceptedReservationsPage}/>
                  <Route path='/radiations' component={RadiationsPage}/>
                  <Route path='/radiations-upload' component={RadiationsUploadPage}/>
                  <Route path='/logs' component={LogsPage} />
                  <Route path='/patients' component={PatientsPage} />
                  <Route path='/preview-study/:id' component={PreviewStudyPage} />
                  <Route path='/add-admin' component={AddAdminPage} />
                  <Route path='/admins' component={AdminsPreviewPage} />
                  <Route path='/clinics/:id' component={ClinicPage} />
                  <Route path='/clinics' component={ClinicsPage} />
                  <Route path='/add-clinic' component={AddClinicPage}/>
                  <Route path='/doctor-preview/:clinicID/:id' component={DoctorProfilePage}/>
                  <Route component={Page404}/>
              </Switch>
          </Content>
        </Layout>
        
        <Button className='float-btn' type='primary' onClick={() => window.scroll(0, 0)} size='large'  shape="circle" icon={<UpOutlined />} />
      </Layout>
    );
}

