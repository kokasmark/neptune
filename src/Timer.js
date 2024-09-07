import React, { Component } from 'react';
import Swal from 'sweetalert2';

class Timer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timeRemaining: 10 * 60, // Time in seconds (10 minutes)
    };
    this.timer = null;
  }

  componentDidMount() {
    this.startTimer();
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  startTimer = () => {
    this.timer = setInterval(() => {
      this.setState(prevState => {
        if (prevState.timeRemaining <= 1) {
          this.clearTimer();
          this.handleTimerEnd(); // Call function when timer hits zero
          return { timeRemaining: 0 };
        }
        return { timeRemaining: prevState.timeRemaining - 1 };
      });
    }, 1000); // Update every second
  };

  clearTimer = () => {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  };

  async popUp(){
    await Swal.fire({title:"Munkamenete lejárt!", text: "Folytatni szeretné?",showDenyButton: true,confirmButtonText: "Folytatás",
      denyButtonText: `Kijelentkezés`, icon:"question"}).then((data)=>{
        if(data.isDenied){
          localStorage.removeItem("loggedIn")
          window.location.reload();
        }else{
          this.props.timerEnd()
          this.setState({timeRemaining: 10*60})
          this.startTimer()
        }
      })
  }
  handleTimerEnd = () => {
    this.popUp()
  };

  formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  render() {
    const { timeRemaining } = this.state;
    return (
      <div>
        <p>| {this.formatTime(timeRemaining)}</p>
      </div>
    );
  }
}

export default Timer;
