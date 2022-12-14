import {
  CompoundButton,
  Depths,
  FontWeights, getTheme, List, MessageBarType, Modal,
  MotionAnimations,
  MotionDurations,
  NeutralColors,
  Persona,
  PersonaSize, PrimaryButton, SearchBox,
  Stack,
  TeachingBubble,
  Text, TextField
} from '@fluentui/react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import TitledList from '@components/TitledList/TitledList'
import AssignmentItem from '@components/AssignmentItem'
import { CSSProperties, FormEventHandler, useEffect, useId, useRef, useState } from 'react'
import RankingItem from '@components/RankingItem'
import { useAppDispatch, useAppSelector } from '@hooks'
import { getCourseById, requestCourse } from '@redux/slices/courseSlice'
import Message from '@components/Message'
import TitledCard from '@components/TitledCard'
import MedalItem from '@components/MetalItem'


const CourseDetailView = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { _id } = useParams()
  const user_id = useAppSelector(state => state.user._id) as string
  const course = useAppSelector(state => state.course.courses.find(course => course._id === _id))
  const cachedCourse = useAppSelector(state => state.course.cache[_id ?? ''])
  const identity = useAppSelector(state => state.user.identity)

  useEffect(() => {
    if (!course && !cachedCourse) {
      dispatch(getCourseById(_id as string))
    }
  }, [course, cachedCourse])

  const [assignmentName, setAssignmentName] = useState('')
  const [teachingBubbleVisible, setTeachingBubbleVisible] = useState(false)
  const [password, setPassword] = useState('')

  const subtitleStyle: CSSProperties = {
    fontWeight: FontWeights.regular,
    color: NeutralColors.gray120,
    marginLeft: '10px'
  }

  const animationStyle: CSSProperties = {
    animation: MotionAnimations.slideUpIn,
    animationDuration: MotionDurations.duration4
  }

  const handleRequest: FormEventHandler<HTMLFormElement> = (ev) => {
    ev.preventDefault()
    dispatch(requestCourse({ user_id, course_id: _id as string, password }))
      .then(({ payload }) => {
        Message.show(payload.ok ? MessageBarType.success : MessageBarType.error, payload.ok ? (cachedCourse.needPermission ? '???????????????????????????????????????' : '???????????????') : payload.error)
          .then(() => {
            payload.ok && window.location.reload()
          })
      })
  }

  return (
    <section style={{ padding: 40 }}>
      <Stack style={animationStyle}>
        <Stack.Item>
          <Text variant="xxLargePlus" style={{ fontWeight: FontWeights.regular }}>{course?.name ?? cachedCourse?.name}</Text>
          {identity === 0 && (
            <Text variant="xLarge" style={subtitleStyle}>{`????????????: ${course?.assignments.reduce((pv, cv) => pv + (cv.scored ?? 0), 0)}`}</Text>
          )}
        </Stack.Item>
        <Stack.Item style={{
          margin: '10px 0 0',
          padding: '20px',
          backgroundColor: 'white'
        }}>
          <Persona styles={{ root: { marginBottom: '10px' } }}
            text={course?.user.name ?? cachedCourse?.user.name}
            secondaryText={course?.user.nickname ?? cachedCourse?.user.nickname}
            size={PersonaSize.size40} />
          <Text variant="mediumPlus">{course?.content ?? cachedCourse?.content}</Text>
        </Stack.Item>
        <Stack.Item>
          <TitledCard title="?????????" subtitle="Medals"
            // indicator
            style={{ marginLeft: 0 }}
            bodyStyle={{ height: '130px', minHeight: 'initial' }}
            actions={identity === 1 ? (
              <PrimaryButton onClick={() => navigate(`/course/create-medal/${_id}`)}>????????????</PrimaryButton>
            ) : undefined} >
            {course?.medals?.map(medal => (
              <MedalItem name={medal.name} iconName={medal.iconName} score={medal.score} content={medal.content as string} />
            ))}
          </TitledCard>
        </Stack.Item>
      </Stack>
      {course && (<>
        <Stack horizontal style={animationStyle}>
          <Stack.Item style={{ marginTop: '40px' }}>
            <NavLink state={course} to={`/course/forum/${_id}`} style={{ textDecoration: 'none' }}>
              <Text variant="xxLarge" style={{
                fontWeight: FontWeights.regular,
                borderBottom: `2px solid ${getTheme().palette.themePrimary}`,
                cursor: 'pointer'
              }}>?????????</Text>
            </NavLink>
            <Text variant="large" style={subtitleStyle}>Forum</Text>
          </Stack.Item>
        </Stack>
        <Stack horizontal>
          <Stack.Item style={{ margin: 0, marginRight: '20px' }} grow={5}>
            <TitledList items={course?.assignments.filter(assign => assign.name.includes(assignmentName)) as any[]} render={AssignmentItem} title="??????" subtitle="Assignments"
              style={{ margin: '0px' }}
              actions={(
                <div style={{ display: 'flex', gap: 20 }}>
                  {identity === 1 && <PrimaryButton onClick={() => navigate(`/course/assignment/create/${_id}`)}>????????????</PrimaryButton>}
                  <SearchBox value={assignmentName} onChange={(ev, newVal) => setAssignmentName(newVal as string)} placeholder="??????????????????" styles={{ root: { minWidth: '400px' } }} />
                </div>
              )} />
          </Stack.Item>
          <Stack.Item style={{ margin: 0 }} grow={1}>
            <TitledList items={course?.rankings!} render={RankingItem} title="?????????" subtitle="Ranking"
              style={{ margin: '0px' }} />
          </Stack.Item>
        </Stack>
      </>)}
      {!course && (
        <div style={{ marginTop: '40px' }}>
          <Text variant="xxLarge" style={{ fontWeight: FontWeights.regular }}>?????????????????????</Text>
          <Text variant="xxLarge" style={{
            marginLeft: 10,
            fontWeight: FontWeights.regular,
            borderBottom: `2px solid ${getTheme().palette.themePrimary}`,
            cursor: 'pointer'
          }} id="request-to-join-text" onClick={() => setTeachingBubbleVisible(true)}>????????????</Text>
          {teachingBubbleVisible && (
            <form onSubmit={handleRequest} id="gelp-request-course-form">
              <TeachingBubble
                target="#request-to-join-text"
                primaryButtonProps={{
                  children: '??????',
                  type: 'submit',
                  form: 'gelp-request-course-form'
                }}
                secondaryButtonProps={{
                  children: '??????',
                  onClick() { setTeachingBubbleVisible(false) }
                }}
                onDismiss={() => setTeachingBubbleVisible(false)}
                headline="???????????????????????????"
              >
                <Text styles={{ root: { color: '#fff' } }}>{cachedCourse.name}, {cachedCourse.user.name}</Text>
                {cachedCourse.needPassword && (
                  <TextField styles={{ description: { color: '#fff' } }}
                    name="password"
                    label="??????"
                    type="password"
                    canRevealPassword
                    required
                    placeholder="???????????????????????????"
                    form='gelp-request-course-form'
                    value={password}
                    onChange={(ev, newVal) => setPassword(newVal as string)}
                  />
                )}
              </TeachingBubble>
            </form>
          )}
        </div>
      )}
    </section>
  )
}

export default CourseDetailView
