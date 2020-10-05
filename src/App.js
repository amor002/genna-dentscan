import React, {useContext} from 'react';
import 'antd/dist/antd.css';
import './stylesheets/App.css';
import './stylesheets/start.css';

import {Route, BrowserRouter as Router, Switch} from 'react-router-dom';
import StartPage, {LoginPage, ReservationPage, ContactPage} from './start_page';
import AdminMain from './admin';
import DoctorStudies, {PreviewStudyPage, DoctorProfilePage, SearchPage, NavBar, AddStudyPage} from './doctor';
import {Page404} from './kit';


export const userContext = React.createContext();

export const clinicModel = {
  name: 'elbasmala',
  doctors: [
    {123: 'ahmed mohamed'}
  ]
}

export const adminsModel = [
  {
    name: 'ahmed mohamed',
    password: 'my password',
    degree: 2
  },
  {
    name: 'ahmed mohamed',
    password: 'my password',
    degree: 2
  },
  {
    name: 'ahmed mohamed',
    password: 'my password',
    degree: 1
  },
  {
    name: 'ahmed mohamed',
    password: 'my password',
    degree: 1
  },
  {
    name: 'ahmed mohamed',
    password: 'my password',
    degree: 1
  },
  {
    name: 'ahmed mohamed',
    password: 'my password',
    degree: 1
  }
]


export const userModel = {
  displayName: 'مروان مفيد',
  isAdmin: false,
  isDoctor: true,
  isAccountant: false,
  isPatient: false,
  uid: 1412,
  acountantClinicId: 'a123mlkmASDOiojaosdi'
}

export const logModel = {
  studyName: 'ahmed hossam',
  radiations: ['x-ray', 'gamma-ray'],
  totalPayed: 150,
  totalRecieved: 80,
  id: 'asapodkOPASkdapOKSDPOK',
  doctorID: '131',
  clinicID: 'ASDOIksioakdOASIdioa',
  doctorName: 'marwan mofeed',
  date: new Date(141131),
  code: '141'
}

export const doctorModel = {
  specialization: 'درس العقل',
  contractionDate: new Date(),
  phoneNumber: '01007927278',
  image: 'https://cdn.sanity.io/images/0vv8moc6/hcplive/0ebb6a8f0c2850697532805d09d4ff10e838a74b-200x200.jpg?auto=format',
  id: 1412,
  whatsAppNumber: null,
  name: 'مروان مفيد',
  balance: 300,
  cardImage: null,
  responsibleEmployee: 'ahmed hossam',
  secretaryName: 'karim ayman',
  secretaryPhoneNumber: '01005169329',
  email: 'doctor@doctor.com',
  showDiscount: true,
  earns: {
    type: 'value',
    value: '10'
  },
  discount: {
    type: 'percentage',
    value: '30',
    discountRadiations: ['x-rays', 'gamma-rays']
  }
}
export const studiesModel = [
  {
    phoneNumber:  '01007927278',
    doctorName: 'marwan mofeed',
    doctorID: '123',
    clinicID: '1sadJjsdAISJdj',
    name: 'عمرو ياسر محمد',
    id: 321,
    radiations: [{
      image: 'https://firebasestorage.googleapis.com/v0/b/center-59cef.appspot.com/o/MRBRAIN.jpg?alt=media&token=ec0ef3e8-2a47-4180-933d-0b527a80e61d',
      type: 'X-Ray',
      date: new Date()
    },{
      image: 'https://firebasestorage.googleapis.com/v0/b/center-59cef.appspot.com/o/case5b.jpg?alt=media&token=7ba25caf-5ec9-4137-9b67-640d3c149f8c',
      type: 'X-Ray',
      date: new Date(1234124)
    }],
    address: 'القاهرة جيزة'
  }
]

export const doctors = [
  'marwan mofeed',
  'ayman hegazy'
  
]

export const radiationTypes = [
  {name: 'x-ray', message: 'متاح حتي السابعة مسائا', price: 300},
  {name: 'بيتا لابيتا', message: 'متاح حتي الثامنة مسائا', price: 300},
  {name: 'alpha-ray', message: 'متاح حتي العاشرة مسائا', price: 300}
]

export const reservationsModel = [
  {
    doctor: {code: '183', name: 'marwan mofeed'},
    radiations: ['x-ray', 'gamma-ray'],
    phoneNumber: '01007927278',
    address: 'cairo/giza',
    name: 'عمرو ياسر محمد',

  }
]

const AnonymousIndex = () => {
  const user = useContext(userContext);
  if(!(user.isDoctor || user.isAccountant || user.isAdmin || user.isPatient)) {
    
    return (
      <>
        <NavBar />
        <Switch>
          <Route path='/login' component={LoginPage}/>
          <Route path='/reserve'>
            <ReservationPage/>
          </Route>
          <Route path='/contact' component={ContactPage}/>
          <Route exact path="/" component={StartPage}/>
          <Route component={Page404}/>
        </Switch>
      </>
    );
  }

  return <></>; 
}


const DoctorIndex = () => {
  const user = useContext(userContext);
  if(user.isDoctor || user.isAccountant) {
    console.log('hey');
    return (
      <>
      <NavBar />
      <Switch>
            <Route  path='/add-study' component={AddStudyPage}/>
            <Route  path='/preview-study/:phoneNumber' component={PreviewStudyPage}/>
            <Route path='/profile/:doctorID' component={DoctorProfilePage}/>
            <Route path='/search/:type/:value' component={SearchPage}/>
            <Route exact path='/' component={DoctorStudies}/> 
            <Route component={Page404}/>
      </Switch>
      </>
    );
  }

  return <></>;
}


const PatientIndex = () => {
  const user = useContext(userContext);
  if(user.isPatient) {
    return <>
      <NavBar />
      <Switch>
        <Route exact path='/'>
          <PreviewStudyPage id={user.uid}/>
        </Route>
        <Route exact path='/reserve'>
          <ReservationPage />
        </Route>
        <Route component={Page404}/>
      </Switch>
    </>;
  }

  return <></>;
}

const AdminIndex = () => {
  const user = useContext(userContext);
  if(user.isAdmin) {
    return <AdminMain />;
  }

  return <></>;
}

function App() {
  return (
    <div className="App">
      <userContext.Provider value={userModel}>
        <Router>  

          <DoctorIndex />
          <AnonymousIndex />
          <PatientIndex />
          <AdminIndex />

        </Router>
      </userContext.Provider>
    </div>
  );
}





export default App;




