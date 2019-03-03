import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  Table,
  Container,
  Card,
  CardBody,
  CardTitle,
  Form,
  FormGroup,
  Label,
  Row,
  Col,
  Input,
  Button
} from 'reactstrap';
import moment from 'moment';
import { CSVLink } from 'react-csv';

const REACT_APP_API_KEY = process.env.REACT_APP_API_KEY;
var base64 = new Buffer(REACT_APP_API_KEY + ':xxx').toString('base64');

function App() {
  const [results, setResults] = useState([]);
  const [peopleResults, setPeopleResults] = useState({});
  const [fromDate, setFromDate] = useState(['']);
  const [toDate, setToDate] = useState(['']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchInputRef = useRef();

  useEffect(() => {}, []);

  const getResults = async () => {
    const startDate = moment(fromDate).format('YYYYMMDD');
    const endDate = moment(toDate).format('YYYYMMDD');
    const timeEntryData = [];
    let currentPage = 1;
    let total_pages = 0;

    try {
      do {
        const response = await axios.get(
          `https://creativeanvil.teamwork.com/time_entries.json?page=${currentPage}&project-name&fromdate=${startDate}&todate=${endDate}&pageSize=500`,
          {
            headers: {
              Authorization: 'BASIC ' + base64
            }
          }
        );

        total_pages = Number(response.headers['x-pages']);
        timeEntryData.push(...response.data['time-entries']);

        setLoading(false);

        currentPage++;
      } while (currentPage <= total_pages);

      getCompanyName_ApiCall();
      setResults(timeEntryData);
    } catch (err) {
      setError(err);
    }

    return timeEntryData;
  };

  const getCompanyName_ApiCall = async () => {
    const peopleData = [];
    const response = await axios.get(
      `https://creativeanvil.teamwork.com/people.json`,
      {
        headers: {
          Authorization: 'BASIC ' + base64
        }
      }
    );

    const rawPeopleData = response.data.people;
    const people = rawPeopleData.reduce((acc, curr) => {
      acc[curr.id] = curr['company-name'];
      return acc;
    }, {});

    setPeopleResults(people);
    return peopleData;
  };

  const handleSubmit = event => {
    event.preventDefault();
    getResults();
  };

  const handleClearSearch = () => {
    setFromDate('');
    setToDate('');
    setLoading(true);
    setResults([]);
    searchInputRef.current.focus();
  };

  const handleFromDateChange = event => {
    const ogValue = event.target.value;
    setFromDate(ogValue);
  };
  const handleToDateChange = event => {
    const ogValue = event.target.value;
    setToDate(ogValue);
  };

  const projectName = 'Project';
  const date = 'Date';
  const task = 'Task';
  const hours = 'Total Time';
  const billable = 'Billable';
  const department = 'Department';
  const empName = 'Employee';

  const getFormatResults = (rawResults, rawPeople) => {
    return [...rawResults].map(data => {
      data.date = moment(data.date).format('MM/DD/YYYY');
      data.isbillable = data.isbillable > '0' ? 'Yes' : '';
      data.time = `${data.hours}:${data.minutes}`;
      data.person = rawPeople[data['person-id']];
      data.fullName = `${data['person-first-name']} ${
        data['person-last-name']
      }`;

      return data;
    });
  };

  const csvHeaders = [
    { label: projectName, key: 'project-name' },
    { label: date, key: 'date' },
    { label: task, key: 'todo-item-name' },
    { label: hours, key: 'time' },
    { label: billable, key: 'isbillable' },
    { label: department, key: 'person' },
    { label: empName, key: 'fullName' }
  ];

  const formattedResults = getFormatResults(results, peopleResults);

  return (
    <>
      <Container>
        <Row>
          <Col sm="12" md={{ size: 5, offset: 3 }}>
            <Card>
              <CardBody>
                <CardTitle className="text-center">
                  <h2>Time Tracking Export</h2>
                </CardTitle>
                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <div className=" mr-md-4 text-center">
                      <div>
                        <Label for="text">Start Date</Label>
                        <Input
                          className="form-control"
                          type="date"
                          onChange={handleFromDateChange}
                          value={fromDate}
                          required
                          ref={searchInputRef}
                        />
                      </div>
                      <div>
                        <Label for="text" className="">
                          End Date
                        </Label>
                        <Input
                          className="form-control"
                          type="date"
                          onChange={handleToDateChange}
                          value={toDate}
                          required
                        />
                      </div>
                      <div className="p-2">
                        <Button type="submit">Search</Button>
                        <Button type="button" onClick={handleClearSearch}>
                          Clear
                        </Button>
                      </div>
                      {results.length > 0 ? (
                        <CSVLink
                          data={formattedResults}
                          headers={csvHeaders}
                          filename={'time_export.csv'}
                          className="btn btn-primary"
                          target="_blank"
                        >
                          Download
                        </CSVLink>
                      ) : null}
                      {error && <div>{error.message}</div>}
                    </div>
                  </FormGroup>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <Row>Total Records Found: {results.length}</Row>
          <Table className="table-layout: auto;">
            <thead>
              <tr>
                <th>#</th>
                <th>{projectName}</th>
                <th>{date}</th>
                <th>{task}</th>
                <th>{hours}</th>
                <th>{billable}</th>
                <th>{department}</th>
                <th>{empName}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}> No dates range selected</td>
                </tr>
              ) : (
                formattedResults.map((data, index) => (
                  <tr key={`${data.id}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{data['project-name']}</td>
                    <td>{data.date}</td>
                    <td>{data['todo-item-name']}</td>
                    <td>{data.time}</td>
                    <td>{data.isbillable}</td>
                    <td>{data.person}</td>
                    <td>{data.fullName}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Row>
      </Container>
    </>
  );
}

export default App;
