import React from 'react'

export const CreateUser = () => {
  return (
    <>
      <h2 class="mb-4">Agregar Nuevo Usuario</h2>
      <div class="">
        <div class="">
          <form class="row g-3">

            <div class="col-sm-12 col-md-12">
              <div class="form-floating">
                <input class="form-control" id="floatingInputGrid" type="text" placeholder="Project title" />
                <label for="floatingInputGrid">Correo Electrónico</label>
              </div>
            </div>
            <div class="col-sm-12 col-md-12">
              <div class="form-floating">
                <input class="form-control" id="floatingInputGrid" type="text" placeholder="Project title" />
                <label for="floatingInputGrid">Nombre</label>
              </div>
            </div>

            {/* Roles */}
            <div class="col-sm-4 col-md-4">
              <div class="form-floating">
                <select class="form-select" id="floatingSelectTask">
                  <option selected="selected" value="1">ADMINISTRADOR</option>
                  <option value="2">external</option>
                  <option value="3">organizational</option>
                </select>
                <label for="floatingSelectTask">Seleccionar Rol</label>
              </div>
            </div>
            
            {/* Password */}
            <div class="col-sm-8 col-md-8">
              <div class="form-floating">
                <input class="form-control" id="floatingInputGrid" type="password" placeholder="Project title" />
                <label for="floatingInputGrid">Contraseña</label>
              </div>
            </div>
            {/* <div class="col-sm-6 col-md-4">
              <div class="form-floating">
                <select class="form-select" id="floatingSelectPrivacy">
                  <option selected="selected">Select privacy</option>
                  <option value="1">Data Privacy One</option>
                  <option value="2">Data Privacy Two</option>
                  <option value="3">Data Privacy Three</option>
                </select>
                <label for="floatingSelectPrivacy">Project privacy</label>
              </div>
            </div>
            <div class="col-sm-6 col-md-4">
              <div class="form-floating">
                <select class="form-select" id="floatingSelectTeam">
                  <option selected="selected">Select team</option>
                  <option value="1">Team One</option>
                  <option value="2">Team Two</option>
                  <option value="3">Team Three</option>
                </select>
                <label for="floatingSelectTeam">Team </label>
              </div>
            </div>
            <div class="col-sm-6 col-md-4">
              <div class="form-floating">
                <select class="form-select" id="floatingSelectAssignees">
                  <option selected="selected">Select assignees </option>
                  <option value="1">One</option>
                  <option value="2">Two</option>
                  <option value="3">Three</option>
                </select>
                <label for="floatingSelectAssignees">People </label>
              </div>
            </div> */}
            {/* <div class="col-sm-6 col-md-4">
              <div class="form-floating">
                <select class="form-select" id="floatingSelectAdmin">
                  <option selected="selected">Select admin</option>
                  <option value="1">ADMINISTRADOR</option>
                  <option value="2">Data Privacy Two</option>
                  <option value="3">Data Privacy Three</option>
                </select>
                <label for="floatingSelectAdmin">Project Lead</label>
              </div>
            </div> */}
            {/* <div class="col-sm-6 col-md-4">
              <div class="flatpickr-input-container">
                <div class="form-floating">
                  <input class="form-control datetimepicker" id="floatingInputStartDate" type="text" placeholder="end date" data-options='{"disableMobile":true}' />
                  <label class="ps-6" for="floatingInputStartDate">Start date</label><span class="uil uil-calendar-alt flatpickr-icon text-body-tertiary"></span>
                </div>
              </div>
            </div>
            <div class="col-sm-6 col-md-4">
              <div class="flatpickr-input-container">
                <div class="form-floating">
                  <input class="form-control datetimepicker" id="floatingInputDeadline" type="text" placeholder="deadline" data-options='{"disableMobile":true}' />
                  <label class="ps-6" for="floatingInputDeadline">Deadline</label><span class="uil uil-calendar-alt flatpickr-icon text-body-tertiary"></span>
                </div>
              </div>
            </div> */}
            {/* <div class="col-12 gy-6">
              <div class="form-floating">
                <textarea class="form-control" id="floatingProjectOverview" placeholder="Leave a comment here" style={{ "height": "100px" }}></textarea>
                <label for="floatingProjectOverview">project overview</label>
              </div>
            </div> */}
            <div class="col-12 gy-6">
              <div class="row g-3 justify-content-end">
                <div class="col-auto">
                  <button class="btn btn-phoenix-primary px-5">Cancelar</button>
                </div>
                <div class="col-auto">
                  <button class="btn btn-primary px-5 px-sm-15">Crear Usuario</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
