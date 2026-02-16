import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { authService } from '../services/auth';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const loadInitialData = useCallback(async () => {
    // Solo cargar si hay autenticación
    if (!authService.isAuthenticated()) {
      console.log('No hay autenticación, esperando login...');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Cargando datos iniciales...');
      
      // Cargar organizaciones
      const orgsResponse = await api.getOrganizations();
      console.log('Respuesta organizaciones:', orgsResponse);
      
      const orgsData = Array.isArray(orgsResponse.data) 
        ? orgsResponse.data 
        : orgsResponse.data.results || [];
      
      console.log('Organizaciones procesadas:', orgsData);
      setOrganizations(orgsData);

      // Recuperar la última organización seleccionada del localStorage
      const savedOrgId = localStorage.getItem('selectedOrganizationId');
      const savedOrg = orgsData.find(org => org.id === parseInt(savedOrgId));
      
      // Seleccionar la organización guardada o la primera disponible
      if (savedOrg) {
        setSelectedOrganization(savedOrg);
        console.log('Organización seleccionada (guardada):', savedOrg);
      } else if (orgsData.length > 0) {
        setSelectedOrganization(orgsData[0]);
        localStorage.setItem('selectedOrganizationId', orgsData[0].id);
        console.log('Organización seleccionada (primera):', orgsData[0]);
      }

      setInitialized(true);
      setLoading(false);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      setLoading(false);
    }
  }, []);

  // Cargar al iniciar si hay autenticación
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Escuchar evento de login para recargar datos inmediatamente
  useEffect(() => {
    const handleLogin = () => {
      console.log('Evento auth-login recibido, recargando datos...');
      setInitialized(false);
      loadInitialData();
    };

    window.addEventListener('auth-login', handleLogin);
    
    return () => {
      window.removeEventListener('auth-login', handleLogin);
    };
  }, [loadInitialData]);

  // Cuando cambia la organización, recargar períodos
  useEffect(() => {
    if (selectedOrganization) {
      loadPeriods();
    }
  }, [selectedOrganization]);

  const loadPeriods = async () => {
    try {
      const periodsResponse = await api.getCarbonPeriods();
      const periodsData = Array.isArray(periodsResponse.data)
        ? periodsResponse.data
        : periodsResponse.data.results || [];
      
      // Filtrar períodos de la organización seleccionada
      const orgPeriods = periodsData.filter(
        p => p.organization === selectedOrganization?.id
      );
      
      setPeriods(orgPeriods);

      // Recuperar el último período seleccionado del localStorage
      const savedPeriodId = localStorage.getItem('selectedPeriodId');
      const savedPeriod = orgPeriods.find(p => p.id === parseInt(savedPeriodId));
      
      // Seleccionar el período guardado, o el activo, o el primero disponible
      if (savedPeriod) {
        setSelectedPeriod(savedPeriod);
      } else {
        const activePeriod = orgPeriods.find(p => p.is_active);
        if (activePeriod) {
          setSelectedPeriod(activePeriod);
          localStorage.setItem('selectedPeriodId', activePeriod.id);
        } else if (orgPeriods.length > 0) {
          setSelectedPeriod(orgPeriods[0]);
          localStorage.setItem('selectedPeriodId', orgPeriods[0].id);
        }
      }
    } catch (error) {
      console.error('Error cargando períodos:', error);
    }
  };

  const changeOrganization = (org) => {
    setSelectedOrganization(org);
    setSelectedPeriod(null); // Reset period cuando cambia la org
    localStorage.setItem('selectedOrganizationId', org.id);
    localStorage.removeItem('selectedPeriodId');
  };

  const changePeriod = (period) => {
    setSelectedPeriod(period);
    localStorage.setItem('selectedPeriodId', period.id);
  };

  const refreshOrganizations = async () => {
    return loadInitialData();
  };

  const refreshPeriods = async () => {
    return loadPeriods();
  };

  const value = {
    selectedOrganization,
    selectedPeriod,
    organizations,
    periods,
    loading,
    changeOrganization,
    changePeriod,
    refreshOrganizations,
    refreshPeriods,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
