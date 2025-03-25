const formatDate = (date: Date): string => {
    return date.toLocaleString('en-US', { timeZone: 'UTC' });
  };
  
  export default formatDate;