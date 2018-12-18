import React, { Component } from 'react';
import lottie from 'lottie-web';

class App extends Component {
  state = {
    animation: {
      style: {
        height: 'auto',
        width: '50%',
        margin: '0 auto'
      },
      fileSrc: './after-effects-animations/no_internet_connection.json',
      eventListenerMap: []
    }
  };
  
  constructor(props) {
    super(props);
    this.animationWrapper = React.createRef();
    this._configureImage = this._configureImage.bind(this); 
    this._handleAnimation = this._handleAnimation.bind(this); 
    this._handleAnimationEventListenerCleanup = this._handleAnimationEventListenerCleanup.bind(this); 
    this._addEventListenerToAnimationStateMap = this._addEventListenerToAnimationStateMap.bind(this); 
  }
  
  async componentDidMount() {
    this._handleAnimation()
  }
  
  componentWillUnmount() {
    let { animation } = this.state;
    // Remove the event listener from the 
    // element instance When the component unmounts 
    this._handleAnimationEventListenerCleanup({ animation });
  }

  _handleAnimationEventListenerCleanup({ animation }) {
    if (animation.eventListenerMap.length) {
      animation.eventListenerMap.map(({ tag, element }) => {
        return element.removeEventListener(tag, this)
      });
    }
  }

  async _handleAnimation() {
    try {
      await this._configureImage();
    } catch (error) {
      console.error(error);
    }
  }

  async _configureImage() {
    let [{ animation }, { current }] = [
      this.state, 
      this.animationWrapper
    ];
    let result = lottie.loadAnimation({
      container: current, // the dom element that will contain the animation
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: animation.fileSrc,  // the path to the animation json
      name: 'Network Error Animation'
    });
    result.addEventListener('data_ready', event => {
      // log to state
      return this._addEventListenerToAnimationStateMap({ 
        tag: 'data_ready', 
        element: current 
      });
    })
    result.addEventListener('loopComplete', event => {
      // log to state
      let { eventListenerMap } = animation;
      let eventTag = eventListenerMap.find(({ tag }) => {
        let { type } = event;
        return (typeof (tag && type) !== 'undefined') && (tag === type);
      });
      if (!eventTag) {
        return this._addEventListenerToAnimationStateMap({
          tag: 'loopComplete',
          element: current
        });
      }
    });
    return result;
  }

  _addEventListenerToAnimationStateMap({ tag, element }) {
    let state = Object.assign({}, this.state);
    let item = { tag, element };
    state.animation.eventListenerMap.push(item);
    this.setState(state);
  }
  
  render() {
    let { animation } = this.state;
    console.log(animation)
    return <div style={animation.style} ref={this.animationWrapper} />;
  }
}

export default App;
