import React from 'react';
import { connect } from "react-redux";
import { fromJS } from "immutable";
import caregivers from "../../redux/actions/caregivers";
import {Caregiver, GlobalAvailability} from "../../types";
import CaregiverAvailabilityForm from "../containers/caregiverLead/CaregiverAvailabilityForm";
import {dayOfWeekAsStringGerman, dayOfWeekAsIntGerman} from "../../model/utils/misc/daysToString";

import { selectCaregiverById } from "../../redux/selectors";
import {RequestStateConnecter, RenderedStateConnecter} from 'redux-request-state';

import moment from 'moment';
import { withRouter } from 'react-router'
import {updateCaregiver} from '../../model/utils/caregivers'

import {GraphQLConnecter} from 'redux-data-fetching';
import ContinousSavingHandler from "./ContinousSavingHandler";
import {FormController} from 'react-forms-state';

type State = {
    general: {
        active: boolean,
        workStartTime: number,
    },
    additionalInformation: string,
};



export function convertStateToCaregiver(caregiver: Caregiver, state: State): Caregiver {

    let date = moment();
    let careStartTime = moment.utc([date.year(), date.month(), date.date(), 0]).add(state.general.workStartTime * 7, 'days');

    let caregiver_profile = {
        additional_information: state.additionalInformation,
    };

    let caregiver_lead_information = {
        care_start_time: careStartTime.unix(),
    }

    let updatedCareprofile = Object.assign({}, caregiver.caregiver_profile, caregiver_profile);
    let updatedLeadInformation = Object.assign({}, caregiver.caregiver_lead_information, caregiver_lead_information);
    let updatedAvailabilities = convertStateToAvailabilities(state.availabilities);

    return Object.assign({}, {id: caregiver.id, availabilities: updatedAvailabilities, active: state.general.active, caregiver_profile: updatedCareprofile, caregiver_lead_information: updatedLeadInformation});
}


export function convertCaregiverToState(caregiver: Caregiver = defaultState()): State {
    let caregiverProfile = caregiver.caregiver_profile ?
        caregiver.caregiver_profile : defaultState().caregiver_profile;

    let leadInformation = caregiver.caregiver_lead_information ?
        caregiver.caregiver_lead_information : defaultState().caregiver_lead_information;

    let date = moment();
    let reference =  moment.utc([date.year(), date.month(), date.date(), 0])
    let care_start_time_in_days = moment.unix(leadInformation.care_start_time).diff(reference, 'days');

    let stateAvailabilities = convertAvailabilitiesToState(caregiver.availabilities);

    return {
        general: {
            active: caregiver.active,
            workStartTime: Math.max(Math.round(care_start_time_in_days / 7), 0),
        },
        additionalInformation: caregiverProfile.additional_information,
        availabilities: stateAvailabilities,
    };
}

export function convertStateToAvailabilities(groupedAvailabilities: State): Array<CaregiverAvailability> {
    if (!groupedAvailabilities)
        return [];

    let ungrouped = groupedAvailabilities.map(groupedAvailability =>
        {
            return getWeekdays(groupedAvailability.value.day).map(day => { return {
                day_of_week: day,
                start_in_minutes_from_midnight: structToMinutes(groupedAvailability.value.fromTime),
                end_in_minutes_from_midnight: structToMinutes(groupedAvailability.value.toTime)
            };})
        })
    return [].concat.apply([], ungrouped);
}

function minutestoStruct(minutes: number) {
    return {hour: Math.floor(minutes / 60), minute: minutes % 60}
}

function structToMinutes(time) {
    if (time)
      return time.minute + 60* time.hour;
    else
      return null;
}

export function convertAvailabilitiesToState(availabilities: Array<CaregiverAvailability>): Array<any>{
    if (!availabilities)
        return [];

    let groupedAvailabilities = availabilities.reduce(function(current, value) {
        let slot = current.find(c => c.start == value.start_in_minutes_from_midnight &&
         c.end == value.end_in_minutes_from_midnight)

         if (!slot) {
             slot = {start: value.start_in_minutes_from_midnight, end: value.end_in_minutes_from_midnight, days: []};
             current.push(slot)
         }

         slot.days.push(value.day_of_week);

         return current;
    }, []);

    groupedAvailabilities.forEach(a => a.days.sort());

    let prettified = groupedAvailabilities.map(a => {
        if (a.days.length == 5 && a.days.every(function(v,i) { return v === i + 1})) {
            return [{fromTime: a.start, toTime: a.end, day: 'Wochentag'}];
        }

        if (a.days.length == 7 && a.days.every(function(v,i) { return v === i + 1})) {
            return [{fromTime: a.start, toTime: a.end, day: 'Täglich'}];
        }

        return a.days.map(day => {return {fromTime: a.start, toTime: a.end, day: dayOfWeekAsStringGerman(day)}})
    })

    return [].concat.apply([], prettified).map((a, i) => {return {id: i.toString(), value: {fromTime: minutestoStruct(a.fromTime), toTime: minutestoStruct(a.toTime), day: a.day}}});
}

function getWeekdays(weekday: String): Array<number> {
    switch (weekday) {
        case 'Täglich':
            return [1, 2, 3, 4, 5, 6, 7];
        case 'Wochentag':
            return [1, 2, 3, 4, 5];
        default:
            return [dayOfWeekAsIntGerman(weekday)]
    }
}

function defaultState() : State {
    return {
        active: false,
        caregiver_profile: {
            care_hours_per_week: '',
            additional_information: '',
        },
        caregiver_lead_information: {
            care_start_time: '',
        },
        availabilities: [],
    };
}

export default withRouter(connect(
  (state, ownProps) => ({
    requests: state.requests,
    data: state.data,
  }),
  (dispatch, ownProps) => ({
    onSubmit: (caregiver) => {dispatch(caregivers.updateByID(ownProps.caregiverId, caregiver))},
    dispatch,
  })
)(GraphQLConnecter(
  props => `{
    caregivers(id: ${props.caregiverId}) {
      id,
      active,
      caregiver_profile {
          additional_information,
      },
      caregiver_lead_information {
          care_start_time,
      },
      availabilities {
          start_in_minutes_from_midnight,
          end_in_minutes_from_midnight,
          day_of_week
      }
    }
  }`,
  (cache, props) => ({
    initial: selectCaregiverById({data: cache}, props.caregiverId).toJS(),
  })
)(RequestStateConnecter(
  props => `caregivers.${props.caregiverId}.update`,
)(FormController(
  state => state,
  (value, props) => convertCaregiverToState(value),
  (value, props) => convertStateToCaregiver(props.initial, value),
)(ContinousSavingHandler(CaregiverAvailabilityForm))))));
