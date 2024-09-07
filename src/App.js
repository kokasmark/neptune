import './App.css';
import { Component,createRef } from 'react';
import Login from './Login';
import AuthRedirect from './authRedirect';

import { FaUser } from "react-icons/fa";
import { VscSignOut } from "react-icons/vsc";
import { FaCalendarCheck } from "react-icons/fa6";
import { FaMessage } from "react-icons/fa6";

import callApi from './api';
import utils from './utils'
import PageLoadAnimation from './PageLoadAnim';
import UserBarWrapper from './Userbar';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Swal from 'sweetalert2';

const localizer = momentLocalizer(moment)
class App extends Component {
  calendarRef = createRef();
  state={
    openedMenu: "",
    openedMenuData: []
  }
  async getFelhAdatok(){
    var r = await callApi("hallgato/main.aspx?ismenuclick=true&ctrl=0101","",true)
    var data = await utils.extractUserData(r)
    this.setState({openedMenu: "felhasznaloAdatok",openedMenuData: data})
  }
  async getOrarend(){
    var raw= {
      "TimeTableID": "upFunction_c_common_timetable_upParent_tabOrarend_ctl00_up_timeTablePerson_upMaxLimit_personTimetable_upTimeTable_TimeTable1",
      "method": "list",
      "viewtype": "week",
      "startdate": "/Date(-2208988800000)/",
      "enddate": "/Date(-2208988800000)/",
      "showTypes": [
          true,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false
      ],
      "isNormalPost": true,
      "timetableform": "2",
      "Term": "70630",
      "WeekType": "140001",
      "SzuloOrarend": false
  }
    var r = await callApi("hallgato/TimeTableHandler.ashx",raw,true)
    var data = await utils.extractTable(JSON.parse(r))
    console.log(data)
    
    this.setState({openedMenu: "orarend",openedMenuData: data})
  }
  async getUzenetek(){
    var r = await callApi("hallgato/main.aspx?ismenuclick=true&ctrl=inbox","", true)
    var data = await utils.extractMessages(r)
    console.log(data)
    this.setState({openedMenu: "uzenetek",openedMenuData: data})
  }
  async logout(){
    localStorage.removeItem("loggedIn")
    window.location.reload()
  }
  classDetail(e){
    Swal.fire({title: e.title, text:`${e.location} - ${e.teachers}`})
  }
  render(){
    const data = this.state.openedMenuData; 
    return (
      <div className="App">
        <UserBarWrapper/>
        <div className='sidebar'>
        <img src={require("./assets/logo.png")} style={{paddingLeft: 20, paddingTop: 50}}/>
          <div className='menu-link' onClick={()=> this.getFelhAdatok()}>
            <FaUser />
            <p>Felhasználói Adatok</p>
          </div>
          <div className='menu-link' onClick={()=> this.getOrarend()}>
            <FaCalendarCheck />
            <p>Órarend</p>
          </div>
          <div className='menu-link' onClick={()=> this.getUzenetek()}>
            <FaMessage />
            <p>Üzenetek</p>
          </div>
          <div className='menu-link logout' onClick={()=> this.logout()}>
            <VscSignOut />
            <p>Kijelentkezés</p>
          </div>
        </div>
        {this.state.openedMenu == "felhasznaloAdatok" &&
        <div className='menu-felh-adatok'>
          <h1>Felhasználói Adatok</h1>
          <div className='data'>
            {
              data.map((data,index) => (<div>
                <p><b>{data.name.replace(":","")}</b></p>
                <p><i>{data.value}</i></p>
              </div>))
            }
          </div>
        </div>}

        {this.state.openedMenu == "orarend" &&
        <div className='menu-orarend'>
          <h1>Órarend</h1>
          <Calendar localizer={localizer} 
            views={['month', 'week']} 
            events={data} 
            startAccessor="start"
            endAccessor="end" ref={this.calendarRef}
            min={new Date('2024-09-07T08:00:00Z')} 
            max={new Date('2024-09-07T20:00:00Z')}
            onDoubleClickEvent={(e)=>this.classDetail(e)}
            />

        </div>}
        {this.state.openedMenu == "uzenetek" &&
        <div className='menu-uzenetek'>
          <h1>Üzenetek</h1>
          <div className="data">
          <table>
            <thead>
              <tr>
                <th>Küldő</th>
                <th>Cím</th>
                <th>Dátum</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} >
                  <td><i>{item.sender}</i></td>
                  <td className={item.opened ?'opened':'unopened'}><b>{item.title}</b></td>
                  <td>{item.sendDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>}
      </div>
    );
  }
}

export default App;
//export default AuthRedirect(App);
