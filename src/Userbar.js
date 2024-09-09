import './App.css';
import { Component } from 'react';
import Login from './Login';
import AuthRedirect from './authRedirect';
import callApi from './api';
import utils from './utils';
import Timer from './Timer';
import { useNavigate } from "react-router-dom";
import { VscSignOut } from "react-icons/vsc";
const UserBarWrapper = ({ hidden,censor }) => {
    const navigate = useNavigate();
    return<UserBar hidden = {hidden} censor={censor} navigate={navigate} />;
  };
class UserBar extends Component 
{
    state = {
        felh_neptunKod: "",
        timer: ""
    }
    async keepAlive(){
        await callApi("hallgato/service.asmx/StayAlive","")
    }
    async componentDidMount(){
        var r = await callApi("hallgato/main.aspx?ismenuclick=true&ctrl=0101","",true)
        var data = await utils.extractUserData(r)
        if(data.length > 0){
            this.setState({felh_neptunKod: data[0].value});
        }else{
            console.log("Token expired")
            localStorage.removeItem("loggedIn")
            const { navigate } = this.props; 
            navigate("/login");
        }
        //this.keepAlive();
    }
    async logout(){
        localStorage.removeItem("loggedIn")
        window.location.reload()
      }
    render(){
        return(
        <div className={this.props.hidden==true ? 'Userbar hidden' : 'Userbar'}>
            <img 
        src={require("./assets/icon-light.png")} />
            <p>Bejelentkezve <b style={{filter: this.props.censor ? "blur(5px)" : "none"}}>{this.state.felh_neptunKod}</b></p>
            <Timer timerEnd={this.keepAlive}/>
            <div className='sign-out' onClick={()=>this.logout()}>
                <VscSignOut />
                <p>Kijelentkezés</p>
            </div>
        </div>);
    }
}

export default  AuthRedirect(UserBarWrapper);