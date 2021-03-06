import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsHistoryComponent } from './projects-history.component';

describe('ProjectsHistoryComponent', () => {
  let component: ProjectsHistoryComponent;
  let fixture: ComponentFixture<ProjectsHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectsHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
