import dayjs from "dayjs";

export const date = (date) => {
  return dayjs(date).tz().format("D. MMM YYYY");
};

export const time = (date) => {
  return dayjs(date).tz().format("H:mm") + 'h';
};

export const day = (date) => {
  return dayjs(date).tz().format("dddd");
};

export const dateTime = (datetime) => {
  return dayjs(datetime).tz().format("D. MMM YYYY H:mm") + 'h';
};

export const diffForHumans = (datetime, withoutSuffix = false) => {
  return dayjs(datetime).tz().fromNow(withoutSuffix);
};
