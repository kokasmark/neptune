import React, { Component } from 'react';
import Swal from 'sweetalert2';

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }
class PageLoadAnimation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      load: false
    };
  }

  async redirect(){
    this.setState({load: true})
    await delay(990);
    return;
  }

  render() {
    return (
      <div>
        {this.state.load ? <div className='page-redirect'/> : <div className='page-load'/>}
      </div>
    );
  }
}

export default PageLoadAnimation;
