import React, { Component } from 'react'
import {
  Link,
  withRouter,
} from 'react-router-dom'
import Loading from '../../fragments/Loading'
import styles from './Register.module.css'
import {
  userRegister,
  userLogin,
  userGet,
  saveSession,
} from '../../utils'

class Register extends Component {

  constructor(props) {
    super(props)

    const pathName = window.location.pathname.replace('/', '')

    this.state = {}
    this.state.state = pathName
    this.state.loading = true
    this.state.error = null
    this.state.formEmail = ''
    this.state.formPassword = ''

    // Bindings
    this.handleFormInput = this.handleFormInput.bind(this)
    this.handleFormSubmit = this.handleFormSubmit.bind(this)
    this.handleFormTypeChange = this.handleFormTypeChange.bind(this)
  }

  /**
   * Component did mount
   */
  componentDidMount() {
    this.setState({
      loading: false
    })

    // Clear query params
    const url = document.location.href
    window.history.pushState({}, '', url.split('?')[0])
  }

  /**
   * Handles a form change
   */
  handleFormTypeChange(type) {
    this.setState({ state: type },
      () => {
        this.props.history.push(`/${type}`)
      })
  }

  /**
   * Handle text changes within form fields
   */
  handleFormInput(field, value) {
    value = value.trim()

    const nextState = {}
    nextState[field] = value

    this.setState(Object.assign(this.state, nextState))
  }

  /**
   * Handles form submission
   * @param {object} evt 
   */
  async handleFormSubmit(evt) {
    evt.preventDefault()

    this.setState({ loading: true })

    // Validate email
    if (!this.state.formEmail) {
      return this.setState({
        loading: false,
        formError: 'email is required'
      })
    }

    // Validate password
    if (!this.state.formPassword) {
      return this.setState({
        loading: false,
        formError: 'password is required'
      })
    }

    let token
    try {
      if (this.state.state === 'register') {
        token = await userRegister(this.state.formEmail, this.state.formPassword)
      } else {
        token = await userLogin(this.state.formEmail, this.state.formPassword)
      }
    } catch (error) {
      console.log(error)
      if (error.message) {
        this.setState({
          formError: error.message,
          loading: false
        })
      } else {
        this.setState({
          formError: 'Sorry, something unknown went wrong.  Please try again.',
          loading: false
        })
      }
      return
    }

    // Fetch user record and set session in cookie
    let user = await userGet(token.token)
    user = user.user
    saveSession(user.id, user.email, token.token)

    window.location.replace('/')
  }

  render() {

    return (
      <div className={`${styles.container} animateFadeIn`}>
        <div className={styles.containerInner}>

          <div className='menuLogoContainer'>
            <a href='/'>
              <img
                className='menuLogo'
                src={'./vaccinate_texas.svg'}
                alt='vaccinate-texas-logo'
              />
            </a>

          </div>
          <div className='menuContainer'>
            <Link to='/register' className='menuLink menuLinkActive'>Register</Link>
            <Link to='/map' className='menuLink'>Map</Link>
            <Link to='/volunteer' className='menuLink'>Volunteer</Link>
            <Link to='/about' className='menuLink'>About</Link>
            <a href='https://twitter.com/vaccinatetexas' target='_blank'>
              <img src={'./twitter-icon.svg'} className='menuIcon' />
            </a>
            <a href='https://github.com/parquar/vaccinate-texas-org' target='_blank'>
              <img src={'./github-icon.svg'} className='menuIcon' />
            </a>
          </div>

          { /* Description Here */}

          <div className={`${styles.heroDescription}`}>
            Get daily SMS notifications with local COVID inventory.
          </div>

          { /* Loading */}

          {this.state.loading && (
            <div>
              {< Loading className={styles.containerLoading} />}
            </div>
          )}

          { /* Registration Form */}

          {!this.state.loading && (
            <div className={styles.formType}>
              <div
                className={
                  `${styles.formTypeRegister} 
                ${this.state.state === 'register' ? styles.formTypeActive : ''}`}
                onClick={(e) => { this.handleFormTypeChange('register') }}>
                Register
              </div>
              <div
                className={
                  `${styles.formTypeSignIn} 
                ${this.state.state === 'unsubscribe' ? styles.formTypeActive : ''}`}
                onClick={(e) => { this.handleFormTypeChange('unsubscribe') }}>
                Unsubsribe
              </div>
            </div>
          )}

          {this.state.state === 'register' && !this.state.loading && (
            <div className={styles.containerRegister}>

              <form className={styles.form} onSubmit={this.handleFormSubmit}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>phone</label>
                  <input
                    type='text'
                    placeholder='512-555-5555'
                    className={styles.formInput}
                    value={this.state.formEmail}
                    onChange={(e) => { this.handleFormInput('formEmail', e.target.value) }}
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>password</label>
                  <input
                    placeholder='Zip Code'
                    className={styles.formInput}
                    value={this.state.formPassword}
                    onChange={(e) => { this.handleFormInput('formPassword', e.target.value) }}
                  />
                </div>

                {this.state.formError && (
                  <div className={styles.formError}>{this.state.formError}</div>
                )}

                <input
                  className={`buttonPrimaryLarge ${styles.formButton}`}
                  type='submit'
                  value='Register'
                />

              </form>
            </div>
          )}

          {this.state.state === 'unsubscribe' && !this.state.loading && (
            <div className={styles.containerSignIn}>

              <form className={styles.form} onSubmit={this.handleFormSubmit}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>phone</label>
                  <input
                    type='text'
                    placeholder='512-555-5555'
                    className={styles.formInput}
                    value={this.state.formEmail}
                    onChange={(e) => { this.handleFormInput('formEmail', e.target.value) }}
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>zip code</label>
                  <input
                    placeholder='Your Zip Code'
                    className={styles.formInput}
                    value={this.state.formPassword}
                    onChange={(e) => { this.handleFormInput('formPassword', e.target.value) }}
                  />
                </div>

                {this.state.formError && (
                  <div className={styles.formError}>{this.state.formError}</div>
                )}

                <input className={`buttonPrimaryLarge ${styles.formButton}`} type='submit' value='Sign In' />
              </form>
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default withRouter(Register)