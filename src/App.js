import React, {useContext, useState, useEffect} from 'react';
import 'antd/dist/antd.css';
import './stylesheets/App.css';
import './stylesheets/start.css';

import {Route, BrowserRouter as Router, Switch} from 'react-router-dom';
import StartPage, {LoginPage, ReservationPage, ContactPage} from './start_page';
import AdminMain from './admin';
import DoctorStudies, {PreviewStudyPage, DoctorProfilePage, SearchPage, NavBar, AddStudyPage, DoctorsList} from './doctor';
import {Page404, Loader} from './kit';
import * as firebase from 'firebase/app';


export const userContext = React.createContext();


const AnonymousIndex = () => {
  const user = useContext(userContext);
  if(!(user.isDoctor || user.isAccountant || user.isAdmin || user.isPatient)) {
    
    return (
      <>
        <NavBar />
        <Switch>
          <Route path='/login' component={LoginPage}/>
          <Route path='/reserve'>
            <ReservationPage onSubmit={async (data) => {
              
             
              let res = await firebase.functions().httpsCallable('makeReservation')({
                ...data,
                radiations: data.radiations.map(r => r.id),
                doctor: {
                  id: Object.keys(data.doctor)[0],
                  name: Object.values(data.doctor)[0]
                }
              });

              if(res.data.ok) {
                window.alert('تم طلب الحجز بنجاح, برجاء الانتظار حتي يتم الاتصال بك لتحديد المعاد او الاتصال بنا');
              }else {
                window.alert('Oops, something went wrong');
              }
            }}/>
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
  if(user.isDoctor) {
    return (
      <>
      <NavBar />
      <Switch>
            <Route  path='/add-study' component={AddStudyPage}/>
            <Route  path='/preview-study/:id' component={PreviewStudyPage}/>
            <Route path='/profile' component={DoctorProfilePage}/>
            <Route path='/search/:type/:value' component={SearchPage}/>
            <Route exact path='/' component={DoctorStudies}/> 
            <Route component={Page404}/>
      </Switch>
      </>
    );
  }

  if(user.isAccountant) {
    return (
      <>
        <NavBar />
        <Route path='/'>
            <div dir='ltr' style={{margin: 30, textAlign: 'left'}}><DoctorsList /></div>
        </Route>
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
          <PreviewStudyPage patient={user}/>
        </Route>
        <Route exact path='/reserve'>
          <ReservationPage onSubmit={async (data) => {
            let doctor = {
              name: user.doctorName,
              id: user.doctorID
            }

            let res = await firebase.functions().httpsCallable('makeReservation')({
              phoneNumber: user.phoneNumber,
              doctor: doctor,
              address: user.address,
              name: user.name,
              radiations: data.radiations.map(r => r.id)  
            });

            if(res.data.ok) {
              window.alert('تم حفظ طلب الحجز بنجاح برجاء الاتصال او انتظار مكالمة لتحديد المعاد');
            }else {
              window.alert('Oops, something went wrong');
            }

          }} />
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
  const [currentUser, setUser] = useState(undefined);
  useEffect(() => {
    firebase.auth().onAuthStateChanged(async function(user) {
      if (user) {
        
        let token = await user.getIdTokenResult();
        let userProfile = {...user,  setUser: setUser};
        
        if(token.claims.adminDegree) {

          userProfile.isAdmin = true;
          userProfile.adminDegree = token.claims.adminDegree;
        }

        if(token.claims.clinicID) {
          userProfile.isAccountant = true;
          userProfile.clinicID = token.claims.clinicID
        }

        userProfile.isPatient = token.claims.isPatient;
        userProfile.isDoctor = token.claims.isDoctor;
        userProfile.doctorClinic = token.claims.doctorClinic;

        if(userProfile.isPatient) {
          let userDoc = await firebase.firestore().collection('studies').doc(userProfile.uid).get();
          userProfile = {...userProfile, ...userDoc.data()};
        }

        setUser(userProfile);
      } else {
        setUser({setUser: setUser, isAnonymous: true});
      }
    });
  }, []);

  if(currentUser === undefined) {
    return <div style={{width: '100%', height: '100vh'}}><Loader /></div>;
  }

  return (
    <div className="App">
      <userContext.Provider value={currentUser}>
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




