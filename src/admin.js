import { Layout, Menu, Card, Divider, DatePicker,
   Form, Button, TimePicker, Row, Col, Input, InputNumber, Upload, message, Select, Radio, Table, Spin } from 'antd';
import { Switch, Route, useHistory } from 'react-router-dom';
import React, {useState, Component} from 'react';
import {Link} from 'react-router-dom';
import {reservationsModel, radiationTypes, logModel, studiesModel, adminsModel} from './App';
import logo from './images/logo.jpg';
import './stylesheets/admin.css';
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


import { Page404, EditableField, reshaped, Loader } from './kit';
import { ReservationPage } from './start_page';
import { useLocation, NavLink } from 'react-router-dom/cjs/react-router-dom.min';
import { PreviewStudyPage, DoctorProfilePage } from './doctor';

const { Content,Sider } = Layout;

const ReservationCardForm = ({reservation}) => {

  return (
    <Form dir='ltr'>
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
          <Button htmlType='submit'>اتمام الحجز</Button>
        </Col>
        <Col style={{marginLeft:5, marginTop: window.screen.availWidth < 357 ? 5 : 0}} flex='50px'>
          <Button danger htmlType='submit'>رفض الطلب</Button>
        </Col>
      </Row>
    </Form>
  );
}


const AcceptedReservationsPage = () => {
  const acceptedReservations = [1,2,3,4].map(() => {

    return {...reservationsModel[0], date: new Date(), moneyToPay: 90};
  });
  return (
    acceptedReservations.map(reservation => {

      return (
        <Card key={reservation.phoneNumber} style={{marginTop: 17}} title={reservation.name}>
          <p> رقم الهاتف : {reservation.phoneNumber} </p>
          <p> الطبيب المسؤل  : {reservation.doctor.name} </p>
          <p> المبلغ المطلوب  : <b>{reservation.moneyToPay} EGP </b></p>
          <p> اليوم : {reservation.date.toLocaleDateString()}</p>
          <p> الميعاد :  {reservation.date.toLocaleTimeString()} </p>
          <b>الاشعة المطلوبة</b>
          <ul>
              {reservation.radiations.map((r, i) => <li key={i}>{r}</li>)}
          </ul>

          <Divider />
          <Row>
            <Col flex='auto'>
              <Button style={{width: '95%'}} type='primary'>تم الدفع</Button>
            </Col>

            <Col flex='auto'>
              <Button style={{width: '95%'}} danger type='primary'>الغاء الحجز</Button>
            </Col>
          </Row>
      </Card>
      );
    })
  );
}

const ReservationsPage = () => {
    const reservations = [...reservationsModel, ...reservationsModel, ...reservationsModel];
    return (
        <div>
            {reservations.map(reservation => {
                return (
                <Card key={reservation.phoneNumber} style={{marginTop: 17}} title={reservation.name}>
                    <p> رقم الهاتف : {reservation.phoneNumber} </p>
                    <p> الطبيب المسؤل  : {reservation.doctor.name} </p>
                    <b>الاشعة المطلوبة</b>
                    <ul>
                        {reservation.radiations.map((r, i) => <li key={i}>{r}</li>)}
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
 
  const navigate = (menuItem) => {
      history.push(menuItem.key);
  }
  return (
      <Sider collapsible collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)}>
      <div style={{backgroundImage: `url(${logo})`, width: '100%',height: 90,marginTop: 10, backgroundPosition: 'center', backgroundSize: 'cover'}} />
      <Menu  defaultSelectedKeys={[location.pathname]} mode="inline">
      <Menu.SubMenu key="admins-sub" title='الادمنز' icon={<UserOutlined />}>
          <Menu.Item onClick={navigate} key='/admins'>الادمنز</Menu.Item>
          <Menu.Item onClick={navigate} key='/add-admin'>اضافة ادمن</Menu.Item>
        </Menu.SubMenu> 
        <Menu.Item onClick={navigate} key="/" icon={<PieChartOutlined />}>
          طلبات الحجوزات
        </Menu.Item>
        <Menu.Item onClick={navigate} key="/accepted-reservations" icon={<FieldTimeOutlined />}>
          المواعيد
        </Menu.Item>

        <Menu.SubMenu icon={<DesktopOutlined />} title='العيادات' key='clinics-sub'>
        <Menu.Item onClick={navigate} key="/clinics">
          جميع العيادات
        </Menu.Item>
        <Menu.Item onClick={navigate} key="/add-clinic">
           اضافة عيادة
        </Menu.Item>
        </Menu.SubMenu>
        
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

        <Menu.Item onClick={navigate} key="/radiations" icon={<BorderInnerOutlined />}>
          الاشعة المتاحة
        </Menu.Item>

        <Menu.Item onClick={() => {}} key="/logout" icon={<LogoutOutlined />}>
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

  return (
    <div style={{margin: 10}}>
      <div style={{background: '#fff', padding: 15}}>
        <h1>اضافة اشعة جديدة</h1>
        <Form>
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

          <Button className='btn-expanded' type='primary' htmlType='submit'>تسجيل</Button>
        </Form>
      </div>
      <h1 style={{margin: '15px 5px', fontSize: 23}}>الاشعة المتوافرة</h1>
      {radiationTypes.map(radiation => {

        return (
          <div key={radiation.name} style={{margin: 20, padding: 13, background: '#fff'}}>
            <Row>
              <h3>اسم الاشعة : </h3>
              <EditableField initialValue={radiation.name}>
                <h3 style={{marginRight: 5}}><b>{radiation.name}</b></h3>
              </EditableField>
            </Row>

            <Row>
              <h3> مواعيد الاشعة : </h3>
              <EditableField initialValue={radiation.message}>
                <h3 style={{marginRight: 5}}><b>{radiation.message}</b></h3>
              </EditableField>
            </Row>
            
            <Row>
              <h3> التكلفة : </h3>
              <EditableField number initialValue={radiation.price}>
                <h3 style={{marginRight: 5}}><b>{radiation.price} EGP</b></h3>
              </EditableField>
            </Row>
            
            <a style={{color: 'red', textDecoration: 'underline'}}>مسح البيانات</a>
          </div>
        );
      })}
    </div>
  );
}

class RadiationsUploadPage extends Component {
  // mkanet4 radya tt3ml hook :)

  state = {fileList: []}

  isWellFormatted(file) {
    return file.name.split('_').length === 2;
  }

  componentDidMount() {
    this.setState({...this.state, radiationTypes: radiationTypes});
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
                fileList: [...state.fileList, file]
              }
            });
          }else {
            this.setState({
              fileList: [...this.state.fileList]
            });

            message.error(`الملف ${file.name} غير مركب بشكل صحيح`);
          }
          
          return false;
        }}

        
        onRemove={file => {
          this.setState(state => {
            
            return {
              fileList: state.fileList.filter(f => f.name !== file.name)
            }
          });
        }}>
          <Button icon={<UploadOutlined />}>اختر الصور</Button>
        </Upload>

        <Button disabled={this.state.fileList.length === 0} type='primary' style={{marginTop: 10}}>ابدأ الرفع</Button>
      </div>
    );
  }
}


const LogsPage = () => {

  const logs = [logModel, logModel, logModel, logModel, logModel];
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
          <h4>تاريخ العملية : {log.date.toLocaleDateString()} {log.date.toLocaleTimeString()}</h4>
          <Button style={{position: 'absolute', left: -8, top: -8}} icon={<CloseOutlined />} shape='circle'/>
          </div>
          </Col>)}
        </Row>
      })}
    </div>
  );
}

const AddAdminPage = () => {
  const [form] = Form.useForm();
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
              message: 'يجب ادخال اسم الادمن'
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

          <Button className='btn-expanded' type='primary' htmlType='submit'>اضافة</Button>
        </Form>
      </div>
    </div>
  );
}

const PatientsPage = () => {

  const results = [...studiesModel, ...studiesModel, ...studiesModel, ...studiesModel, ...studiesModel, ...studiesModel];
  const [searchValue, setSearchValue] = useState();
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

      <div style={{margin: 10}}>
        {reshaped(results, 4).map((res, i) => {

          return <Row gutter={[16,16]} key={i}>
            {res.map((k, j) => 
              <Col flex='auto' key={j}>
                <Link to={`preview-study/${k.uid}`}>
                  <div className='card'>
                      <h4>الاسم : {k.name}</h4>
                      <h4>الكود : {k.uid}</h4>
                      <h4>رقم الهاتف : {k.phoneNumber}</h4>
                  </div>
                </Link>
              </Col>
           )}
          </Row>
        })}
      </div>
    </div>
  );
}


const AdminsPreviewPage = () => {

  const admins = adminsModel;

  return <div style={{margin: 20}}>
    <h1 style={{marginTop: 10, marginBottom: 10}}>المديرين</h1>
    {reshaped(admins.filter(i => i.degree > 1), 3).map((adminsRow, i) => {
      return <Row gutter={[16, 16]} key={i}>
        {adminsRow.map(admin => {
          return <Col flex='auto'><div className='card' key={admin.name}>
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
          return <Col flex='auto'><div className='card' key={admin.name}>
              <h3>الاسم : {admin.name}</h3>
              <h3>كلمة السر : {admin.password}</h3>
              <Button danger>مسح الحساب</Button>
          </div></Col>
        })}
      </Row>;
    })}

  </div>;
}


const ClinicsPage = () => {
  const clinics = [{doctors: [{313:'ahmed kamal'}, {123:'omar mohamed'}],id: 'adasdasd', name: 'الصفا و المروا'},
  {doctors: [{313:'ahmed kamal'}, {123:'omar mohamed'}],id: 'asdasdasdas', name: 'الصفا و المروا'},
   {doctors: [{313:'ahmed kamal'}, {123:'omar mohamed'}],id: 'asdasdasd', name: 'الصفا و المروا'}];

   return <div style={{padding: 20}}>
     <h1>العيادات المتعاقد معها</h1>
     {reshaped(clinics, 3).map((arr) => {

       return <Row gutter={[16, 16]}>
         {arr.map(clinic => {
           return <Col flex='auto'>
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

  return (
    <div style={{width: '100%', padding: 20,
     display: 'flex', justifyContent: 'center',
      alignItems: 'center', height: '100%'}}>
        <div style={{width: 'auto'}} className='login-form'>
          <center><h1>اضافة طبيب</h1></center>
        <Form>
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

          <Button className='btn-expanded' type='primary' htmlType='submit'>اضافة</Button>
        </Form>

        </div>

    </div>
  );
}

const ClinicAddAccountantRoute = ({match}) => {
  
  return (
    <div style={{width: '100%', padding: 20,
     display: 'flex', justifyContent: 'center',
      alignItems: 'center', height: '100%'}}>
        <div className='login-form'>
          <center><h1>اضافة محاسب</h1></center>
        <Form>
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

          <Button className='btn-expanded' type='primary' htmlType='submit'>اضافة</Button>
        </Form>

        </div>

    </div>
  );
}

const ClinicInfoRoute = ({match}) => {
  const clinic = {
    id: 'adasdakdak',
    name: 'الصفا و المروا',
    doctors: [
      {221: 'ahmed kamal'},
      {112:'ayman nour'}
    ]
  }

  const accountants = [
    {
      name: 'ayman zein',
      phoneNumber: '01005169329',
      id: 'assAPSDKPOAksdpA03pOKSAd',
      password: 'my password'
    },
    {
      name: 'karim abbass',
      phoneNumber: '01007927278',
      id: 'afaAsAPSDKPOAksdpA03pOKSAd',
      password: 'my second password'
    }
  ];

  return <div style={{width: '100%', padding: 20}}>
  <center><h1>عيادة {clinic.name}</h1></center>
  <div style={{background: '#fff', padding: 10}}>
    <h2><b>المحاسبين</b></h2>
    {
      accountants.map(accountant => {

        return <div key={accountant.id}>
            <h4>الاسم: {accountant.name}</h4>
            <h4>رقم الهاتف: {accountant.phoneNumber}</h4>
            <h4> اسم المستخدم: {accountant.id.substr(0, 6)}</h4>
            <h4>كلمة المرور: {accountant.password}</h4>
            <Divider />
        </div>
      })
    }
  </div>

  <div style={{background: '#fff', padding: 10, marginTop: 15}}>
    <h2><b>الاطباء</b></h2>
    <ul>
      {clinic.doctors.map(doctor => {
        const docId = Object.keys(doctor)[0];
          return <li key={docId}><Link to={`/doctor-preview/${clinic.id}/${docId}`}>{Object.values(doctor)[0]}</Link></li>;
      })}
    </ul>
  </div>
</div>


}

const AddClinicPage = () => {
  return (
    <div className='start-container'>
      <div className='login-form'>
        <center><h1>اضافة العيادة</h1></center>
        <Form>
          <label>اسم العيادة</label>
          <Form.Item
          name='username'
          rules={[
            {
              required: true,
              message: 'يجب ادخال اسم العيادة'
            }
          ]}
          >
            <Input />
          </Form.Item>

          <Button className='btn-expanded' type='primary' htmlType='submit'> اضف العيادة</Button>
        </Form>
      </div>
    </div>
  );
}

const DoctorPreviewPage = ({match}) => {

  return <DoctorProfilePage id={match.params.id} clinicID={match.params.clinicID}/>
}

export default () => {
    
    return (
        <Layout dir='ltr' style={{ minHeight: '100vh' }}>
       <Layout className="site-layout">
           <SideMenu />
          <Content dir='rtl' style={{ margin: '10px 16px 0px 16px' }}>
              <Switch>
                  <Route path='/' exact component={ReservationsPage}/>
                  <Route path='/add-patient'><ReservationPage /></Route>
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
                  <Route path='/doctor-preview/:clinicID/:id' component={DoctorPreviewPage}/>
                  <Route component={Page404}/>
              </Switch>
          </Content>
        </Layout>
        
        <Button className='float-btn' type='primary' onClick={() => window.scroll(0, 0)} size='large'  shape="circle" icon={<UpOutlined />} />
      </Layout>
    );
}

