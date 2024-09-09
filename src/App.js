import './App.css';
import { Component,createRef } from 'react';
import Login from './Login';
import AuthRedirect from './authRedirect';

import { FaUser } from "react-icons/fa";

import { FaCalendarCheck } from "react-icons/fa6";
import { FaMessage } from "react-icons/fa6";
import { FaGear } from "react-icons/fa6";
import { FaNoteSticky } from "react-icons/fa6";
import { IoArrowBack } from "react-icons/io5";
import { FaCircle } from "react-icons/fa";

import callApi from './api';
import utils from './utils'
import PageLoadAnimation from './PageLoadAnim';
import UserBarWrapper from './Userbar';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Swal from 'sweetalert2';
import Switch from 'react-ios-switch';
import ToggleSwitch from './ToggleSwitch';
import Notes from './Notes';

const localizer = momentLocalizer(moment)
class App extends Component {
  calendarRef = createRef();
  state={
    openedMenu: "",
    openedMenuData: [],
    openedJegyzet:"",
    censor: localStorage.getItem("neptune-setting-censor") ? localStorage.getItem("neptune-setting-censor") == "true" : false
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
  backToMenu(){
    this.setState({openedMenu: ""})
  }
  classDetail(e){
    Swal.fire({title: e.title, confirmButtonText: "Jegyzetek", showDenyButton:true,
      denyButtonText:"Bezárás",text:`${e.location} - ${e.teachers}`}).then((data) =>{
        if(data.isConfirmed){
          this.setState({openedMenu: "jegyzetek", openedJegyzet: e.title})
        }
      })
  }
  changeDisplayMode(isDarkMode) {
    
  }
  censorUserData(e){
    this.setState({censor: e})
  }
  render(){
    const data = this.state.openedMenuData; 
    return (
      <div className="App" id="app">
        <UserBarWrapper hidden={this.state.openedMenu != ""} censor={this.state.censor}/>
        <img 
        src={require("./assets/logo-light.png")} 
        className="logo"
        style={{filter: this.state.openedMenu == "" ? "opacity(1)" : "opacity(0)" }}/>
        {this.state.openedMenu == "felhasznaloAdatok" &&
        <div className='menu-felh-adatok menu'>
          <div className='back-to-menu' 
          onClick={()=>this.backToMenu()}
         >
            <IoArrowBack />
            <p>Vissza</p>
          </div>
          <h1>Felhasználói Adatok</h1>
          <div className='data'>
            {
              data.map((data,index) => (<div>
                <p><b>{data.name.replace(":","")}</b></p>
                <p style={{filter: this.state.censor ? "blur(5px)" : "none"}}><i>{data.value}</i></p>
              </div>))
            }
          </div>
        </div>}

        {this.state.openedMenu == "orarend" &&
        <div className='menu-orarend menu'>
          <div className='back-to-menu' 
          onClick={()=>this.backToMenu()}>
            <IoArrowBack />
            <p>Vissza</p>
          </div>
          <h1>Órarend</h1>
          <Calendar localizer={localizer} 
            views={['month','work_week','day']}
            defaultView='work_week'
            events={data.map(event => ({
              ...event,
              start: new Date(moment.utc(event.start).format("YYYY-MM-DDTHH:mm:ss")),
              end: new Date(moment.utc(event.end).format("YYYY-MM-DDTHH:mm:ss")),
            }))} 
            startAccessor="start"
            endAccessor="end" ref={this.calendarRef}
            min={new Date('2024-09-07T08:00:00')} 
            max={new Date('2024-09-07T20:00:00')}
            onDoubleClickEvent={(e)=>this.classDetail(e)}
            />

        </div>}
        {this.state.openedMenu == "uzenetek" &&
        <div className='menu-uzenetek menu'>
          <div className='back-to-menu' onClick={()=>this.backToMenu()}>
            <IoArrowBack />
            <p>Vissza</p>
          </div>
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
        {this.state.openedMenu == "jegyzetek" && 
        <Notes folder={this.state.openedJegyzet} callback={()=>this.backToMenu()}/>}
        {this.state.openedMenu == "beallitasok" &&<div className='menu-beallitasok menu'>
          <div className='back-to-menu' onClick={()=>this.backToMenu()}>
            <IoArrowBack />
            <p>Vissza</p>
          </div>
         <h1>Beállítások</h1>
         <div className='settings'>
          <div className='setting'>
            <p>2FA bejelenkezésnél</p>
            <ToggleSwitch name={"2fa"} defaultValue={true}/>
          </div>
          <div className='setting'>
            <p>Ékszakai Mód</p>
            <ToggleSwitch name={"night-mode"} defaultValue={false} onChange={this.changeDisplayMode()}/>
          </div>
          <div className='setting'>
            <p>Személyes adatok elrejtése</p>
            <ToggleSwitch name={"censor"} defaultValue={false} onChange={(e)=>this.censorUserData(e)}/>
          </div>
         </div>
        </div>}
        {this.state.openedMenu == "" &&<div className='home menu'>
              <div className='home-card' 
              onClick={()=> this.getFelhAdatok()}
              style={{animationDelay: "0s"}}>
                <FaUser />
                <p>Felhasználói Adatok</p>
              </div>
              <div className='home-card' 
              onClick={()=> this.getOrarend()}
              style={{animationDelay: "0.2s"}}>
              <FaCalendarCheck />
              <p>Órarend</p>
              </div>
              <div className='home-card' 
              onClick={()=> this.getUzenetek()}
              style={{animationDelay: "0.4s"}}>
              <FaMessage />
              <p>Üzenetek</p>
              </div>
              <div className='home-card' 
              onClick={()=> this.setState({openedMenu: "jegyzetek",openedJegyzet: ""})}
              style={{animationDelay: "0.6s"}}>
              <FaNoteSticky />
              <p>Jegyzetek</p>
              </div>
              <div className='home-card' 
              onClick={()=> this.setState({openedMenu: "beallitasok"})}
              style={{animationDelay: "0.8s"}}>
              <FaGear />
              <p>Beállítások</p>
              </div>
        </div>}
      </div>
    );
  }
}

export default App;
//export default AuthRedirect(App);
