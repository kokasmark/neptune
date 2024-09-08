import logo from './logo.svg';
import './App.css';
import { Component, createRef } from 'react';
import SelectSearch from 'react-select-search';
import 'react-select-search/style.css'
import callApi from './api';
import Swal from 'sweetalert2'
import { useNavigate } from "react-router-dom";
import utils from './utils';

const LoginWrapper = () => {
  const navigate = useNavigate();

  return <Login navigate={navigate} />;
};
class Login extends Component {
  state = {
    institutes: [],
    instituteOptions: [],
    twoFAInput: "",
    loginSuccess: false,
    news: []
  }
  azonositoInput = createRef();
  jelszoInput = createRef();
  pageLoad= createRef();
  async getNews() {
    try {
      // Call the API and get the raw HTML response
      var r = await callApi("hallgato/login.aspx", "", true);
  
      // Use the utils.extractNews to parse the HTML and extract the news
      var data = await utils.extractNews(r);
  
      // Update the state and log it after the update
      this.setState({ news: data }, () => {
        // Callback after state update to check if state is correctly set
        console.log(this.state.news);
      });
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  }
  
  componentDidMount() {
    // Fetch the JSON file from assets
    var data = require('./assets/institutes.json');
    
    const instituteOptions = data.map(institute => ({
      name: institute.Name,
      value: institute.Url
    }));
  
    // Set institutes and options
    this.setState({ institutes: data, instituteOptions: instituteOptions });
  
    // Fetch the news
    this.getNews();
  }
  async checkLoginEnable() {
    const raw = {
      "user": this.azonositoInput.current.value,
      "pwd": this.jelszoInput.current.value,
      "UserLogin": null,
      "GUID": null,
      "captcha": ""
    };
    var r = await callApi("hallgato/login.aspx/CheckLoginEnable", raw);
    var cleanedData = r.d
      .replace(/(\w+):/g, '"$1":')
      .replace(/'/g, '"')
      .replace('"True"', 'true')
      .replace('"False"', 'false');

    try {
      var d = JSON.parse(cleanedData);
      if (d.success) {
        await Swal.fire({
          title: "Kétfaktoros hitelesítés",
          text: "Kérem írja be az authentikáló eszközén jelenleg érvényes 6 számjegyű tokent",
          input: "text"
        }).then((data) => { this.setState({ twoFAInput: data.value }) })

        const raw = {
          "request": {
            "Token": this.state.twoFAInput
          }
        };
        if (this.state.twoFAInput.length == 6) {
          var r = await callApi("hallgato/login.aspx/ValidateToken", raw);
          console.log(r)
          if (r.Message != null) {
            Swal.fire(r.Message)
          } else if (r.d.Errors[0]) {
            Swal.fire({ text: r.d.Errors.Logout[0], icon: "error" })
          }
          else {
            await Swal.fire({ text: "Sikeres bejelenkezés!", icon: "success" })
            this.setState({ loginSuccess: true })
            localStorage.setItem("loggedIn",true)
            const { navigate } = this.props;
            navigate("/");

          }
        }else{
          Swal.fire({ text:"A megadott token formátuma hibás!", icon: "error" })
        }
      }
      else {
        Swal.fire({ text: d.errormessage, icon: "error" })
      }
    } catch (error) {
      console.error("Error parsing JSON: ", error);
    }
  }
  
  render() {
    const {news} = this.state;
    return (
      <div className="Login">
        <div className={'inputs'}>
          <img src={require("./assets/logo.png")} />
          <label className="input">
            <input className="input-field" type="text" placeholder=" " ref={this.azonositoInput} />
            <span className="input-label">Azonosító</span>
          </label>
          <label className="input">
            <input className="input-field" type="password" placeholder=" " ref={this.jelszoInput} />
            <span className="input-label">Jelszó</span>
          </label>
          <label className="input">
            <div className="input-field">
              <SelectSearch options={this.state.instituteOptions} search={true}
                onChange={(e) => localStorage.setItem("neptun-url", e)}
                defaultValue={"https://netw8.nnet.sze.hu/hallgato/MobileService.svc"} disabled={true} />
            </div>
            <span className="input-label">Intézmény</span>
          </label>
          <button className='rounded-btn' onClick={() => this.checkLoginEnable()}>Bejelentkezés</button>
        </div>
        <div className='news'>
          <h1>Friss Hírek</h1>
        {news.map((item, index) => (
          <div>
            {item.content.length > 0 && <div className='news-card' key={index}>
              <h3><b>{item.title}</b></h3>
              <p>{item.content}</p>
            </div>}
          </div>
          ))}
        </div>
      </div>
    );
  }
}

export default LoginWrapper;
