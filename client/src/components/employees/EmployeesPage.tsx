import React, {useState,useMemo} from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {Edit,Plus} from 'lucide-react'
import { useNavigate } from 'react-router-dom';

// Components
import Table from '../common/Table';
import Button from '../common/Button';
import Card from '../common/Card';
import Modal from '../common/Modal';

// Services
//import { projectApi, type Project } from '@/services/api';
import api from '../../services/api';

// Type
import { TableColumn } from '../../types';


const EmployeesPage: React.FC = () => {

    return (
        <div>
            <h1>Employees Page</h1>
            <p>This is the Employees page.</p>
        </div>
    )

};
export default EmployeesPage;