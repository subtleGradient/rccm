/*---------------------------------------------------------------------------*\
  =========                 |
  \\      /  F ield         | OpenFOAM: The Open Source CFD Toolbox
   \\    /   O peration     |
    \\  /    A nd           | www.openfoam.com
     \\/     M anipulation  |
-------------------------------------------------------------------------------
    Copyright (C) 2011-2016 OpenFOAM Foundation
    Copyright (C) 2019 OpenCFD Ltd.
    Modified 2026 by Binyamin Tsadik Bair-Mosheh
-------------------------------------------------------------------------------
License
    This file is part of OpenFOAM.

Application
    asymmetricTensorFoam

Description
    Transient solver for a micropolar (Cosserat) vacuum continuum.
\*---------------------------------------------------------------------------*/

#include "fvCFD.H"
#include "pisoControl.H"

int main(int argc, char *argv[])
{
    #include "postProcess.H"
    #include "addCheckCaseOptions.H"
    #include "setRootCaseLists.H"
    #include "createTime.H"
    #include "createMesh.H"

    pisoControl piso(mesh);

    #include "createFields.H"
    #include "initContinuityErrs.H"

    Info<< "\nStarting time loop\n" << endl;

    while (runTime.loop())
    {
        Info<< "Time = " << runTime.timeName() << nl << endl;
        #include "CourantNo.H"

        volTensorField gradU = fvc::grad(U);
        volSymmTensorField S = symm(gradU);
        volTensorField Omega = skew(gradU);

        dimensionedScalar cLimit("cLimit", dimVelocity, 1.0);
        volScalarField magSqrU = magSqr(U);
        
        // BOUNDED FRACTURE LIMIT: Floor raised to 1e-2 to preserve matrix invertibility
        volScalarField alphaSq = max
        (
            dimensionedScalar("one", dimless, 1.0) - (magSqrU / sqr(cLimit)),
            dimensionedScalar("minCapacity", dimless, 1e-2)
        );

        dimensionedScalar alpha_bare("alpha_bare", dimless, 1.0/137.036);
        dimensionedScalar alpha_visc("alpha_visc", dimViscosity, 1e-5);
        volScalarField E_ratio = max(magSqrU / sqr(cLimit), dimensionedScalar("eps", dimless, 1e-12));
        volScalarField De = alpha_bare * E_ratio;
        volScalarField alpha_s = alpha_bare / De;

        volScalarField S_ii = (alpha_visc / alpha_s) / alphaSq;
        T = (S_ii * S) + (alpha_visc * Omega);

        fvVectorMatrix UEqn
        (
            fvm::ddt(U)
          + fvm::div(phi, U)
          - fvm::laplacian(S_ii, U)
          + fvc::laplacian(S_ii, U)
          - fvc::div(T)
        );

        if (piso.momentumPredictor())
        {
            solve(UEqn == -fvc::grad(p));
        }

        while (piso.correct())
        {
            volScalarField rAU(1.0/UEqn.A());
            volVectorField HbyA(constrainHbyA(rAU*UEqn.H(), U, p));
            surfaceScalarField phiHbyA
            (
                "phiHbyA",
                fvc::flux(HbyA)
              + fvc::interpolate(rAU)*fvc::ddtCorr(U, phi)
            );

            adjustPhi(phiHbyA, U, p);
            constrainPressure(p, U, phiHbyA, rAU);

            while (piso.correctNonOrthogonal())
            {
                fvScalarMatrix pEqn
                (
                    fvm::laplacian(rAU, p) == fvc::div(phiHbyA)
                );
                pEqn.setReference(pRefCell, pRefValue);
                pEqn.solve(p.select(piso.finalInnerIter()));
                if (piso.finalNonOrthogonalIter())
                {
                    phi = phiHbyA - pEqn.flux();
                }
            }
            #include "continuityErrs.H"
            U = HbyA - rAU*fvc::grad(p);
            U.correctBoundaryConditions();
        }
        runTime.write();
        runTime.printExecutionTime(Info);
    }
    Info<< "End\n" << endl;
    return 0;
}
