'use babel'
// @flow

import React from 'react';
import { connect } from "react-redux";
import { fromJS, List, Map } from "immutable";
import moment from 'moment';
import update from 'react-addons-update';

import AppointmentForm from 'veyo-commons/components/presenters/appointments/AppointmentForm';
import ActionButton from 'veyo-commons/components/presenters/forms/ActionButton';
import FormPage from 'veyo-commons/components/presenters/forms/FormPage';
import ResultBox from 'veyo-commons/components/presenters/misc/ResultBox';
import { GraphQLContainer } from 'veyo-commons/redux/graphql';
import RequestStateConnecter from 'redux-request-state/lib/react';
import actions from 'veyo-commons/redux/actions/appointments';
import type {Appointment, Caregiver, Patient} from 'veyo-commons/types';
import {ASKED, ACCEPTED, DECLINED, CANCELLED, DONE} from 'veyo-commons/consts';
import SuccessActionButton from "veyo-commons/components/presenters/forms/SuccessActionButton";
import ErrorActionButton from "veyo-commons/components/presenters/forms/ErrorActionButton";
import LoadingActionButton from "veyo-commons/components/presenters/forms/LoadingActionButton";
import SaveActionButton from "veyo-commons/components/presenters/forms/SaveActionButton";
import * as $ from "veyo-commons/components/presenters/styles/constants";

import {mapCaregiversToCacheMapper} from 'veyo-commons/model/utils/caregivers';
import {mapPatientsToCacheMapper} from 'veyo-commons/model/utils/patients';

export class AppointmentCreation extends React.Component<any, Props, State> {

  state: State
  props: Props
  static defaultProps: any;

  constructor(props: Props) {
    super(props);
    let defaultState = {
      name: "",
      id: "",
      date: {
        day: moment().date().toString(),
        month: moment().month(),
        year: moment().year().toString()
      },
      interval: {
        debut: moment().add(1, 'hour').format("HH:mm"),
        end: moment().add(1, 'hour').add(30, 'minutes').format("HH:mm"),
      },
      status: "Accepted",
    };
    if (this.props.params.appointment) {
      let appointment: Appointment = this.props.appointments.find((a: Appointment): boolean => a.id == parseInt(this.props.params.appointment));
      if (appointment)
        this.state = convertAppointmentToState(appointment, this.props.type, this.props.caregivers);
      else
        this.state = defaultState;
    } else {
      this.state = defaultState;
    }
  }

  getUsers():
    {caregiver: {id: string}, patient: {id: string, name: string}} |
    {caregiver: {id: string, name: string}, patient: {id: string}} {

      console.log("APP", this.props);

    if (this.props.type == "caregiver") {
      return {
        caregiver: {
          id: this.props.caregiverId,
        },
        patient: {
          id: this.state.id,
          name: this.state.name
        }
      }
    } else {
      return {
        patient: {
          id: this.props.patientId
        },
        caregiver: {
          id: this.state.id,
          name: this.state.name,
        }
      }
    }
  }

  setState(state: State) {
    super.setState(state);
  }

  render() {
    let DataComponent = RequestStateConnecter(this.props.params.appointment ? `appointments.${this.props.params.appointment}.editing` : 'appointments.creation', {
      mapStateToComponent: {
        'PENDING': (<LoadingActionButton/>),
        'SUCCESS': (<SuccessActionButton onClick={() => this.props.onSave(this.state, this.props.params.appointment)}/>),
        'ERROR': (<ErrorActionButton onClick={() => this.props.onSave(this.state, this.props.params.appointment)}/>),
        'DEFAULT': (<SaveActionButton onClick={() => this.props.onSave(this.state, this.props.params.appointment)}/>),
      },
      mapRequestToProps: {},
      useCache: (props, requestState) => false
    }, {});
    let SubmitButton = connect((state) => ({reducer: state.requests}))(DataComponent);
    return (
      <FormPage>
        <div style={{
          width: "100%",
          height: '300px',
          overflow: 'auto',
          position: "absolute",
          bottom: "0px",
          left: "0px",
          backgroundColor: "#fff",
          boxShadow: $.boxShadowInactive,
          zIndex: "1",
          visibility: this.state.id == "" && this.state.name.length > 1 ? "visible" : "hidden",
        }} className="results-container">
          {
            this.props.type == "patient" ?
            (
              <GraphQLContainer needs={`{
                caregivers {
                  id,
                  lead_id,
                  active,
                  account {
                      first_name,
                      last_name,
                      email,
                  },
                }
              }`} mapCacheToProps={mapCaregiversToCacheMapper(c => c.name.toLowerCase().indexOf(this.state.name.toLowerCase()) != -1)}>
                <ResultBox type="users" onUserClick={user => this.setState(update(this.state, {
                  name: {$set: user.name},
                  id: {$set: user.id},
                }))}/>
              </GraphQLContainer>
            ) :
            (
              <GraphQLContainer needs={`{
                patients {
                  id,
                  lead_id,
                  account {
                    id,
                    first_name,
                    last_name,
                    email,
                  },
                  admin_account {
                    id,
                    first_name,
                    last_name,
                  }
                },
              }`} mapCacheToProps={mapPatientsToCacheMapper(p => p.name.toLowerCase().indexOf(this.state.name.toLowerCase()) != -1)}>
                <ResultBox type="users" onUserClick={user => this.setState(update(this.state, {
                  name: {$set: user.name},
                  id: {$set: user.id},
                }))}/>
              </GraphQLContainer>
            )
          }
        </div>
        <AppointmentForm type={this.props.type} value={this.state} onChange={value => this.setState(update(value, {
          id: {$set: value.name == "" ? "" : value.id}}))}>
          <SubmitButton/>
        </AppointmentForm>
      </FormPage>
    )
  }
}

AppointmentCreation.propTypes = {

};

AppointmentCreation.defaultProps = {

};

type Props = {
  type: 'caregiver' | 'patient',
  caregivers: Array<Caregiver>,
  caregiverId: string,
  patientId: string,
  appointments: Array<Appointment>,
  params: {
    appointment: string
  },
  onSave: (state: State, appointment: string) => {}
}

type State = {
  id: string,
  name: string,
  date: {
    day: string,
    month: string,
    year: string
  },
  interval: {
    debut: string,
    end: string,
  },
  status: string,
};

function convertStateToAppointment(state: State, appointmentId, props: Props): Appointment {

  let convertedDate = moment({
    year: parseInt(state.date.year),
    // $FlowFixMe: suppressing this error until iflow fixes it
    month: state.date.month,
    day: parseInt(state.date.day),
    hour: 0,
    minutes: 0
  });
  let debut = moment(convertedDate).add(moment.duration(state.interval.debut));
  let end = moment(convertedDate).add(moment.duration(state.interval.end));
  let convertStatusToInt = (status) => {
    if (status == "Asked")
      return ASKED;
    else if (status == "Accepted")
      return ACCEPTED;
    else if (status == "Declined")
      return DECLINED;
    else if (status == "Cancelled")
      return CANCELLED;
    else if (status == "Done")
      return DONE;
    else
      return 0;
  };
  console.log(props, state);
  return {
    // $FlowFixMe
    id: appointmentId,
  	patient: {id: props.type == 'patient' ? parseInt(props.patientId) : parseInt(state.id)},
  	caregiver: {id: props.type == 'patient' ?  parseInt(state.id) : parseInt(props.caregiverId)},
  	start_timestamp: debut.unix(),
  	length_in_minutes: moment.duration(end.diff(debut)).asMinutes(),
  	price_in_euro_per_hour: state.priceInEuro,
  	status: convertStatusToInt(state.status),
  };
}

function convertAppointmentToState(appointment: Appointment, type: "patient" | "caregiver", caregivers: Array<Caregiver>): State {
  let convertIntToStatus = (status: typeof ASKED | typeof ACCEPTED | typeof DECLINED | typeof CANCELLED | typeof DONE): "ASKED" | "Accepted" | "Declined" | "Cancelled" | "Done" | "Unknown" => {
    if (status == ASKED)
      return "ASKED";
    else if (status == ACCEPTED)
      return "Accepted";
    else if (status == DECLINED)
      return "Declined";
    else if (status == CANCELLED)
      return "Cancelled";
    else if (status == DONE)
      return "Done";
    else
      return "Unknown";
  };
  return {
    id: type == "patient" ? appointment.caregiver.id.toString() : appointment.patient.id.toString(),
    name: type == "patient" ? appointment.caregiver.name : appointment.patient.name,
    date: {
      day: moment.unix(appointment.start_timestamp).date().toString(),
      month: moment.unix(appointment.start_timestamp).month(),
      year: moment.unix(appointment.start_timestamp).years().toString()
    },
    interval: {
      debut: moment.unix(appointment.start_timestamp).format("HH:mm"),
      end: moment.unix(appointment.start_timestamp).add(appointment.length_in_minutes, "minutes").format("HH:mm"),
    },
    priceInEuro: appointment.price_in_euro_per_hour,
    status: convertIntToStatus(appointment.status)
  };
}

export default connect(
  (state: any, ownProps: any): {caregivers: Array<Caregiver>, patients: Array<Patient>, appointments: Array<Appointment>} => ({
    caregivers: state.data.get('caregivers', List()).toJS(),
    patients: state.data.get('patients', List()).toJS(),
    appointments: state.data.get('appointments', List()).toJS(),
  }),
  (dispatch, ownProps) => ({
    dispatch,
    onSave: (infos, appointmentId) => dispatch(
      appointmentId ?
      actions.updateByID(convertStateToAppointment(infos, parseInt(appointmentId), ownProps), appointmentId)
      :
      actions.create(convertStateToAppointment(infos, undefined, ownProps))
    )
  })
)(AppointmentCreation);
